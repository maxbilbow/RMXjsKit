/**
 * Created by Max Bilbow on 24/11/2015.
 */
define(function () {
    var cache = {};

    function toStack(e) {
        return e;//e.stack ? e.stack + ' >> ' + e : e;
    }
    return (function($this){
        $this.sub($this.ERROR,console.error);
        return $this;
    })({
        INFO: 'debug-info', WARN : 'debug-warning', ERROR : 'debug-error', NONE:'debug-none',
        info:function(msg,e) {
            console.log(msg,e || '');
            this.pub(this.INFO,msg,e);
        },
        warn:function(msg,e) {
            console.warn(msg,e);
            this.pub(this.WARN,msg,e);
        },
        error:function(msg,e) {
            console.error(arguments);
            this.pub(this.ERROR,msg,e);
        },
        pub: function (id) {
            if (id===this.NONE)
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
                } catch (e){
                    console.error(e);
                }
            }
            return this;
        },
        sub: function (id, fn) {
            if (id===this.NONE)
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
        },
        unsub: function (id, fn) {
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
        }
    });
});