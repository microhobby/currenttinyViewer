
chrome.Event = function() 
{
	var listeners = [];

	this.addListener = (cbk) => {
		if (typeof(cbk) == "function")
			listeners.push(cbk);
	};
	
	this.dispatch = (evt) => {
		for (let i = 0; i < listeners.length; i++)
			listeners[i](evt);
	};
	
	this.hasListener = (cbk) => {
		for (let i = 0; i < listeners.length; i++) {
			if (listeners[i] === cbk) {
				return true;
			}
		}
	};

	this.hasListeners = () => {
		throw new Error("Not implemented");
	};

	this.removeListener = (cbk) => {
		for (let i = 0; i < listeners.length; i++) {
			if (listeners[i] === cbk) {
				listeners.splice(i, 1);
			}
		}
	};
}
