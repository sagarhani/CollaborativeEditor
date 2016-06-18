(function ( mw, $, TogetherJS ) {

	
	var instances = function() {
		return (window.ve && window.ve.instances) || [];
	};
	// Find the VE Surface associated with the given HTML element.
	var findVE = function(el) {
		var found = null;
		instances().forEach(function(surface) {
			if (surface.$[0] === el && !found) {
				found = surface;
			}
		});
		return found;
	};

	// Create a VisualEditor tracker for TogetherJS.
	var VETracker = function(el) {
		this.element = $(el);
		this.surface = findVE(el);
		console.assert(this.surface);
		// add change listener
		this.surface.model.on('change', this._change, [], this);
	};
	VETracker.prototype.trackerName = "VisualEditor";
	VETracker.prototype.tracked = function(el) {
		return this.element[0] === el;
	};
	VETracker.prototype.destroy = function(el) {
		// remove change listener
		this.surface.model.off('change', this._change);
	};
	VETracker.prototype._change = function() {
		console.log("VE _change");
	};
	VETracker.prototype.update = function(msg) {
		console.log("VE update");
		// XXX apply deltas
	};
	VETracker.prototype.init = function(update, msg) {
		console.log("VE init");
		// XXX initialize
	};
	VETracker.prototype.makeInit = function() {
		console.log("VE makeInit");
		var elementFinder = TogetherJS.require("elementFinder");
		var value = 'XXX';
		return {
			element: elementFinder.elementLocation(this.element),
			tracker: this.trackerName,
			value: value
		};
	};

	// Find all instances of VE on this page.
	VETracker.scan = function() {
		return instances().map(function(surface) {
			console.assert(surface.$.length === 1);
			// return the element associated with this Surface
			return surface.$[0];
		});
	};

	// Does the given element correspond to a tracked instance of VE?
	VETracker.tracked = function(el) {
		return instances().some(function(surface) {
			return surface.$[0] === el;
		});
	};

	// Register this tracker with TogetherJS
	var registerTracker = function() {
		if (!TogetherJS.addTracker) {
			console.warn("Can't register VE tracker, TogetherJS is too old");
			return;
		}
		TogetherJS.addTracker(VETracker);
	};

	// Defer registration if TogetherJS is not loaded yet.
	if (TogetherJS.require) {
		registerTracker();
	} else {
		TogetherJS.once('ready', registerTracker);
	}

}( mediaWiki, jQuery, TogetherJS ) );