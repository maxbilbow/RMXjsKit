/**
 * Created by Max Bilbow on 25/11/2015.
 */
require(['jquery', 'view/web-console', 'service/pub-sub'], function ($, $wc, $ps) {

    var console = $wc.getInstance();
    console.debugLevel = $ps.INFO;
    $ps.info('SETUP SUCCESS');


    $ps.sub($ps.LOG,function (aMessage) {
       console.log(aMessage);
        for (var i in arguments)
        {
            if (i > 0)
            {
                console.log('    ' + JSON.stringify(arguments[i]));
            }
        }
    });

    var _wsHelper, _builder;
    function wsHelper(val){
        if (val) {
            _wsHelper = val;
        } else {
            return _wsHelper;
        }
    }
    var newDesc = 'Can be used to add additional components.' +
        '\n       OPTIONS:' +
        '\n         socket: adds WebSocket Connectivity View' +
        '\n         decoder: enables JSON decoding of websocket responses' +
        '\n         Builder: Screen Item Builder';

    console.terminal.onProcess('new', function $this (cmd, txt) {
        switch (cmd[1]) {
            case 'socket':
                if (wsHelper()) break;
                require(['view/ws-helper'], function (WSHelper) {
                    wsHelper(new WSHelper(console));
                    this.console.log('WSHelper generated');
                    $ps.pub('WSHelper');
                });
                break;
            case 'decoder':
                if(wsHelper()) {
                    if (wsHelper().decoder) {
                        this.log('Decoder already exists.');
                    } else {
                        require(['service/json-decoder'], function (Decoder) {
                            wsHelper().decoder = new Decoder();
                            this.console.log('Decoder added');
                            $ps.pub('Decoder');
                        });
                    }
                } else {
                    this.print('You must add webSocket functionality first. \n   Add it now? y/n','color: orange;');
                    this.expectsReply = true;
                    this.onReply = function(txt) {
                        if (txt[0]  === 'y' | 'Y'){
                            $this(['new','socket'],'new socket',terminal);
                            $ps.sub('WSHelper',function() {
                                $this(['new', 'decoder'], 'new decoder', terminal);
                            });
                        } else if (txt[0]  === 'n' | 'N') {
                            this.log('Aborted');
                        } else {
                            this.expectsReply = true;
                        }
                    }
                }
                break;
            case 'builder':
            case 'Builder':
                if (_builder) {
                    $ps.log('builder already initialized');
                    break;
                }
                require(['view/ScreenItemBuilder'], function (Builder) {
                    // _builder = new Builder();
                    _builder = new Builder($,$ps);
                    console.terminal.onProcess('build',function (cmd, txt, terminal) {
                        var args = txt.split(',');
                        var data = {};
                        for (var i in args)
                        {
                            var pair = args[i].split('=');
                            if (pair.length === 2)
                            {
                                data[pair[0].trim()] = pair[1].trim();
                            }
                        }
                        $ps.log('Building: ',data);
                        _builder.build(data);
                    },'Builds an html element');
                    $ps.log('new Builder()',_builder);
                });


                break;
            default:
                console.log(newDesc,cmd[0]);
                break;
        }
        return true;
    }, newDesc
    );
});