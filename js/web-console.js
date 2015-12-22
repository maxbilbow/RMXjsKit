/**
 * Created by Max Bilbow on 25/11/2015.
 */
require(['jquery', 'view/web-console', 'service/pub-sub'], function ($, $wc, $ps) {

    var console = $wc.getInstance();
    console.debugLevel = $ps.INFO;
    $ps.info('SETUP SUCCESS');

    var _wsHelper;
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
        '\n         decoder: enables JSON decoding of websocket responses';
    console.terminal.onProcess('new', function $this (cmd, txt, terminal) {
        switch (cmd[1]) {
            case 'socket':
                if (wsHelper()) break;
                require(['view/ws-helper'], function (WSHelper) {
                    wsHelper(new WSHelper(console));
                    terminal.console.log('WSHelper generated');
                    $ps.pub('WSHelper');
                });
                break;
            case 'decoder':
                if(wsHelper()) {
                    if (wsHelper().decoder) {
                        terminal.console.log('Decoder already exists.');
                    } else {
                        require(['service/json-decoder'], function (Decoder) {
                            wsHelper().decoder = new Decoder();
                            terminal.console.log('Decoder added');
                            $ps.pub('Decoder');
                        });
                    }
                } else {
                    terminal.console.print('You must add webSocket functionality first. \n   Add it now? y/n','color: orange;');
                    terminal.expectsReply = true;
                    terminal.onReply = function(txt) {
                        if (txt[0]  === 'y' | 'Y'){
                            $this(['new','socket'],'new socket',terminal);
                            $ps.sub('WSHelper',function() {
                                $this(['new', 'decoder'], 'new decoder', terminal);
                            });
                        } else if (txt[0]  === 'n' | 'N') {
                            terminal.console.log('Aborted');
                        } else {
                            terminal.expectsReply = true;
                        }
                    }
                }
                break;
            default:
                console.log(newDesc,cmd[0]);
                break;
        }
        return true;
    }, newDesc
    );
});