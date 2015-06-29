/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:






/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/

function $Promise() {
    this.state = "pending";
    this.value = undefined;
    this.handlerGroups = [];
    this.updateCbs = [];
}

function Deferral() {
    this.$promise = new $Promise();
    this.$promise.forwarder = this;
}

var defer = function() {
    return new Deferral();
};

Deferral.prototype.resolve = function(data) {
    if ((data || data === 0) && this.$promise.state === 'pending') {
        this.$promise.value = data;
        this.$promise.state = "resolved";
    } else if (this.$promise.state === 'pending') {
        this.$promise.state = "resolved";
    }
    // if (this.$promise.value instanceof $Promise) {
    //     this.$promise = thi
    // }
    this.$promise.callHandlers();
};

Deferral.prototype.reject = function(err) {
    if (err && this.$promise.state === 'pending') {
        this.$promise.value = err;
        this.$promise.state = "rejected";
    } else if (this.$promise.state === 'pending') {
        this.$promise.state = "rejected";
    }
    this.$promise.callHandlers();
};

Deferral.prototype.notify = function(val) {
    var $promise = this.$promise;
    if ($promise.state === "pending") {
        for (var cb = 0; cb < $promise.updateCbs.length; cb++) {
            $promise.updateCbs[cb](val);   
        }
    }
};

$Promise.prototype.then = function(successCb, errorCb, updateCb) {
    var deferral = defer();
    var handlerGroup = {
        successCb: typeof successCb === 'function' ? successCb : null,
        errorCb: typeof errorCb === 'function' ? errorCb : null,
        forwarder: deferral
    };
    if (typeof(updateCb) === "function") {
        this.updateCbs.push(updateCb);
    }
    this.handlerGroups.push(handlerGroup);
    this.callHandlers();
    deferral.$promise.identifier = ".THEN PROMISE";
    return deferral.$promise;
};

$Promise.prototype.callHandlers = function() {
    var s;
    var promiseVal = this.value; 
    for (var h = 0; h < this.handlerGroups.length; h++) {
        handler = this.handlerGroups[h];
        if (this.state === "resolved") {
            if (handler.forwarder.$promise.state === "pending") {
                if (handler.successCb) {
                    try {
                        s = handler.successCb(promiseVal);
                    } catch (err) {
                        handler.forwarder.reject(err);
                    }
                    if (s && s instanceof $Promise) {
                        var oldSDeferral = handler.forwarder;
                        s.then(function(value) {
                            oldSDeferral.resolve(value);
                        });

                        s = null;

                    } else if(s) {
                        handler.forwarder.resolve(s);
                    } else {
                        handler.forwarder.resolve(promiseVal);    
                    }
                } else {
                    handler.forwarder.resolve(promiseVal);
                }

            }
        } else if (this.state === 'rejected') {
            if (handler.forwarder.$promise.state === 'pending') {
                if (handler.errorCb) {
                    var e;
                    try {
                        e = handler.errorCb(promiseVal);
                    } catch (err) {
                        handler.forwarder.reject(err);
                    }
                    if (e && e instanceof $Promise) {
                        var oldEDeferral = handler.forwarder;
                        e.then(function(value) {
                            oldEDeferral.resolve(value);
                        });

                        e = null;
                    } else if (e) {
                        handler.forwarder.resolve(e);
                    } else {
                        handler.forwarder.resolve(promiseVal);
                    }
                } else {
                    handler.forwarder.reject(promiseVal);
                }
            }
        }
    }

    for (h = 0; h < this.handlerGroups.length; h++) {
        if (this.handlerGroups[h].forwarder.$promise.state === 'resolved') {
            this.handlerGroups.splice(h, 1);
        }

    }

};


$Promise.prototype.catch = function(errorHandler) {
    return this.then(null, errorHandler);
};