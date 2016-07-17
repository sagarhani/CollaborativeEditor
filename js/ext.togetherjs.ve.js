(function ( mw, $, TogetherJS ) {
	"use strict";

	// Get ve instances, without dying if ve is not defined on this page.
	var instances = function() {
		return (window.ve && window.ve.instances) || [];
	};

	// Find the VE Surface associated with the given HTML element.
	var findVE = function(el) {
		var found = null;
		instances().forEach(function(surface) {
			if (surface.$element[0] === el && !found) {
				found = surface;
			}
		});
		return found;
	};

	// assertion helper
	var assert = function(b, msg) {
		if (!b) { throw new Error('Assertion failure: '+( msg || '' )); }
	};

	var deepcopy = function( obj, callback ) {
		callback = callback || function() {};
		var mapper = function( obj ) {
			var lookaside = callback( obj );
			if ( lookaside !== undefined ) {
				return lookaside;
			}
			if ( Array.isArray( obj ) ) {
				return obj.map( mapper );
			} else if (typeof( obj )==='object') {
				return Object.keys( obj ).reduce( function( nobj, key ) {
					nobj[key] = mapper( obj[key] );
					return nobj;
				}, {} );
			}
			return obj;
		};
		return mapper( obj );
	};

	// Serialize ve.dm.Transaction objects.
	var serializeIntention = function(transaction) {
		var ve = window.ve; // be safe w.r.t load order.
		return deepcopy( transaction.intention, function mapper( value ) {
			if ( value instanceof ve.Range ) {
				return { type: 've.Range', from: value.from, to: value.to };
			}
			if ( value instanceof ve.dm.Annotation ) {
				return {
					type: 've.dm.Annotation',
					// handle any embedded DOM nodes
					element: deepcopy( value.element, mapper )
				};
			}
			if ( value && value.nodeType ) {
				return {
					type: 'DOM Node',
					html: $('<body/>').append( $( value ).clone() ).html()
				};
			}
		});
	};
	// Deserialize ve.dm.Transaction objects.
	var parseIntention = function( obj ) {
		var ve = window.ve; // be safe w.r.t load order.
		assert( !( obj instanceof ve.dm.Transaction ) );
		var intention = deepcopy( obj, function parser( value ) {
			if ( value && typeof value ==='object' ) {
				if ( value.type === 've.Range' ) {
					return new ve.Range( value.from, value.to );
				}
				if ( value.type === 've.dm.Annotation' ) {
					// handle embedded DOM nodes
					var element = deepcopy( value.element, parser );
					return ve.dm.annotationFactory.create( element.type, element );
				}
				if ( value.type === 'DOM Node' ) {
					return $.parseHTML( value.html )[0];
				}
			}
		});
		//return new ve.dm.Transaction.newFromIntention( doc, intention );
		return intention;
	};

	// Document proxy objects.
	var VEDocProxy = function(tracker) {
		this.tracker = tracker;
		this.historyPointer = 0;
		this.queue = null; // linked list
	};
	VEDocProxy.prototype.getQueue = function() {
		var q, result = [];
		for (q = this.queue; q ; q = q.tail) {
			result.push(q.item);
		}
		result.reverse(); // linked lists always end up backwards!
		return result;
	};
	VEDocProxy.prototype.applyToModel = function() {
		var dmSurface = this.tracker.surface.model;
		var history, i, transactions;

		history = dmSurface.documentModel.getCompleteHistorySince(
			this.historyPointer);
		transactions = [];
		for (i = history.length - 1; i >= 0; i--) {
			if (!history[i].UNDONE) {
				continue; /* skip undone */
			}
			assert(!history[i].UNDONE);
			var r = history[i].reversed();
			r.UNDONE = history[i].UNDONE = true;
			transactions.push( r );
		}
		if (transactions.length > 0) {
			dmSurface.changeInternal(
				transactions, new window.ve.Range( 0, 0 ), true
			);
		}

		// apply the transactions in the queue to the model
		// XXX selection is lost.
		this.getQueue().forEach(function( txproxy ) {
			var tx = txproxy.toTx( dmSurface.documentModel );
			dmSurface.changeInternal(
				[ tx ], new window.ve.Range( 0, 0 ), true
			);
		});

		dmSurface.emit( 'history' ); 

		this.historyPointer =
			dmSurface.documentModel.getCompleteHistoryLength();
		this.queue = null;
	};

	// Transaction proxy objects.
	var VETransProxy = function(transaction, intention) {
		assert(transaction === null ? Array.isArray( intention ) : transaction instanceof window.ve.dm.Transaction);
		this.transaction = transaction;
		this.intention = transaction ? transaction.intention : intention;
	};
	VETransProxy.prototype.toTx = function( doc ) {
		return this.transaction ||
			window.ve.dm.Transaction.newFromIntention( doc, this.intention );
	};
	VETransProxy.prototype.apply = function(docproxy) {
		var result = new VEDocProxy(docproxy.tracker);
		var dmSurface = docproxy.tracker.surface.model;
		var h =
			dmSurface.documentModel.completeHistory[docproxy.historyPointer];
		if (docproxy.queue === null && h &&
			h === this.transaction && !h.UNDONE) {
			result.historyPointer = docproxy.historyPointer + 1;
			return result;
		}
		// Otherwise, leave the history pointer alone and add this
		// patch to the queue.
		result.historyPointer = docproxy.historyPointer;
		result.queue = {
			item: this,
			tail: docproxy.queue
		};
		return result;
	};
	VETransProxy.prototype.transpose = function(transproxy) {
		// Implemented in VE core.  Unwrap/wrap here.
		return new VETransProxy(
			this.transaction.transpose(transproxy.transaction));
	};

	// Create a VisualEditor tracker for TogetherJS.
	var VETracker = function(el, sendData) {
		this.element = (el instanceof $) ? el[0] : el; // real DOM element
		this.surface = findVE(el);
		this.documentModel = this.surface.model.documentModel;
		this.sendData = sendData.bind(null);

		var target = window.ve.init.target;
		this.revid = target ? target.revid : undefined;

		// add change listener
		this.surface.model.documentModel.on('transact', this._change, [], this);
	};
	VETracker.prototype.trackerName = "VisualEditor";

	VETracker.prototype.tracked = function(el) {
		return this.element === el;
	};

	VETracker.prototype.getHistory = function() {
		return this.history;
	};

	VETracker.prototype.setHistory = function(history) {

		return (this.history = history);
	};

	VETracker.prototype.getContent = function() {
		var docproxy = new VEDocProxy(this);
		docproxy.historyPointer =
			this.documentModel.getCompleteHistoryLength();
		return docproxy;
	};

	VETracker.prototype.destroy = function(el) {
		// remove change listener
		this.surface.model.documentModel.off('transact', this._change);
	};

	VETracker.prototype._change = function() {
		// suppress change event while we're updating the model
		if (this._inRemoteUpdate) { return; }

		var commitPointer = this.history.current.historyPointer;
		this.documentModel.getCompleteHistorySince(commitPointer).
			forEach(function(transaction) {
				if (transaction.UNDONE) { return; }
				this.sendData({
					tracker: this.trackerName,
					element: this.element,
					value: transaction
				});
			}.bind(this));
	};

	VETracker.prototype.makeDelta = function(history, transaction) {
		return new VETransProxy(transaction);
	};

	VETracker.prototype.serializeDelta = function(delta) {
		return serializeIntention( delta.transaction );
	};

	VETracker.prototype.parseDelta = function(delta) {
		// apply this change to the history.
		return new VETransProxy(null, parseIntention(delta));
	};

	VETracker.prototype.update = function(msg) {
		try {
			this._inRemoteUpdate = true;
			this.history.current.applyToModel();
		} finally {
			this._inRemoteUpdate = false;
		}
	};

	// Sync up a newly-started peer with the existing collaborative state.
	VETracker.prototype.parseInitValue = function( value ) {
		// if revid doesn't match, then we can't synchronize this.
		if (value.revid !== this.revid) { return; }
		// ok, roll back document status then run all the transactions.
		var docproxy = new VEDocProxy(this); // clean slate.
		value.transactions.forEach(function(transaction) {
			transaction = new VETransProxy(null, parseIntention(transaction));
			docproxy = transaction.apply(docproxy);
		});
		return docproxy;
	};

	// Serialize the current state of this visual editor, so
	// that a newly-added peer can be sync'ed up.
	VETracker.prototype.serializeInitValue = function(committed) {
		var commitPointer = committed.historyPointer;
		var transactions = this.documentModel.
			getCompleteHistorySince(0).
			slice(0, commitPointer).
			filter(function(transaction) {
				return !transaction.UNDONE;
			});
		return {
			revid: this.revid,
			transactions: transactions.map(serializeIntention)
		};
	};

	// Find all instances of VE on this page.
	VETracker.scan = function() {
		return instances().map(function(surface, idx) {
			assert(surface.$element.length === 1);
			// add an ID (helps togetherjs find this element)
			surface.$element[0].id = "ve-togetherjs-" + idx;
			// return the element associated with this Surface
			return surface.$element[0];
		});
	};

	// Does the given element correspond to a tracked instance of VE?
	VETracker.tracked = function(el) {
		return instances().some(function(surface) {
			return surface.$element[0] === el;
		});
	};

	// Register this tracker with TogetherJS
	var registerTracker = function() {
		if (!TogetherJS.addTracker) {
			/* jshint devel:true */
			console.warn("Can't register VE tracker, TogetherJS is too old");
			return;
		}
		TogetherJS.addTracker(VETracker, false /* Don't skip setInit */ );
	};
	TogetherJS.on('ready', registerTracker);

	mw.hook( 've.activationComplete' ).add( TogetherJS.reinitialize.bind(TogetherJS) );
	mw.hook( 've.deactivationComplete' ).add( TogetherJS.reinitialize.bind(TogetherJS) );

	var uri = new mw.Uri();
	if ( uri.query.veaction === 'edit' ) {
		mw.hook( 've.activationComplete' ).add( function() {
			mw.hook( 'togetherjs.autostart' ).fire();
		});
	} else {
		$( function() { mw.hook( 'togetherjs.autostart' ).fire(); } );
	}

}( mediaWiki, jQuery, TogetherJS ) );
