/**
 * Created by Max Bilbow on 23/11/2015.
 */

require(['jquery', 'view/ws-helper', 'view/web-console', 'service/pub-sub', 'service/log-decoder'],
    function ($, WSHelper, WebConsole, ps, Decoder) {
        $(document).ready(function () {
            var wc = WebConsole.getInstance();

            $('input[name=debug-level]:radio').change(function (evt) {
                wc.debugLevel = evt.target.value;
                ps.pub(wc.debugLevel,'Debug mode set to: ' + wc.debugLevel);
            });
            ps.info('Debug mode set to: ' + (
                    wc.debugLevel = $('input[name=debug-level]:checked').val()
                ));

            var helper = new WSHelper(wc, new Decoder());

            if (helper.decoder) {
                ps.info('decoder attached');
            } else {
                ps.error('Decoder was not attached: ' + Decoder);
            }

            wc.onComplete(function (success) {
                if (success == false) {
                    wc.print('<i>Failed: ' + wc.last() + '</i>');
                    ps.error('Failed to send: ' + wc.last());
                } else {
                    ps.info('Successfully send command: ' + wc.last());
                }
            });

            var uriOpt = $('select#uri-options');
            var updateUri = function () {
                $('.get-uri').val($('select#uri-options  option:selected').text());
            };

            updateUri();
            uriOpt.change(function(){
                updateUri();
                ps.info('Connection changed to: '+helper.onGetUri());
                helper.connect();
            });
            


            helper.connect();


        });
    });