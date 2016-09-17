/**
 * Created by Max Bilbow on 24/11/2015.
 */
function PubSub(){
    return this.constructor.call(this);
}

(function () {
    "use strict";
    if (PubSub.isDefined === true)
    {
        (PubSub.INSTANCE || new PubSub()).warn('PubSub already defined');
        return;
    }
    PubSub.isDefined = true;
    PubSub.INSTANCE = null;

    PubSub.prototype.constructor = function () {
        return PubSub.INSTANCE || (PubSub.INSTANCE = this);
    };

    var cache = {};

    PubSub.LOG = PubSub.prototype.LOG = 'LOG';
    PubSub.INFO = PubSub.prototype.INFO = 'INFO';
    PubSub.WARN = PubSub.prototype.WARN = 'WARN';
    PubSub.ERROR = PubSub.prototype.ERROR = 'ERROR';
    PubSub.NONE = PubSub.prototype.NONE = 'NONE';


    PubSub.prototype.pub = function (aId) {
        var id = aId;
        if (id === PubSub.NONE)
            return this;
        var args = [].slice.call(arguments, 1);

        if (!cache[id]) {
            cache[id] = {
                callbacks: [],
                args: [args]
            };
        } else {
            cache[id].args.push(args);
        }

        for (var i = 0, il = cache[id].callbacks.length; i < il; i++) {
            try {
                cache[id].callbacks[i].apply(null, args);
            } catch (e) {
                console.error(e);
            }
        }
        return this;
    };
    PubSub.prototype.sub = function (id, fn) {
        if (id === PubSub.NONE)
            return this;
        if (!cache[id]) {
            cache[id] = {
                callbacks: [fn],
                args: []
            };
        } else {
            cache[id].callbacks.push(fn);

            for (var i = 0, il = cache[id].args.length; i < il; i++) {
                fn.apply(null, cache[id].args[i]);
            }
        }
        return this;
    };

    PubSub.prototype.unsub = function (id, fn) {
        var index;
        if (!cache[id]) {
            return;
        }

        if (!fn) {
            cache[id] = {
                callbacks: [],
                args: []
            };
        } else {
            index = cache[id].callbacks.indexOf(fn);
            if (index > -1) {
                cache[id].callbacks = cache[id].callbacks.slice(0, index).concat(cache[id].callbacks.slice(index + 1));
            }
        }
    };

    PubSub.prototype.info = function () {
        console.info.apply(PubSub.INFO,arguments);//(msg, e );
        Array.prototype.unshift.call(arguments,PubSub.INFO);
        this.pub.apply(this, arguments);
    };

    PubSub.prototype.warn = function () {
        console.warn.apply(PubSub.WARN, arguments);
        Array.prototype.unshift.call(arguments,PubSub.WARN);
        this.pub.apply( this, arguments);
    };

    PubSub.prototype.error = function () {
        console.error.apply(PubSub.ERROR,arguments);
        Array.prototype.unshift.call(arguments,PubSub.ERROR);
        this.pub.apply(this, arguments);
    };

    PubSub.prototype.log = function () {
        console.log.apply(null, arguments);
        Array.prototype.unshift.call(arguments,PubSub.LOG);
        this.pub.apply(this,arguments);
    };
})();


define(function () {
    return new PubSub();
});