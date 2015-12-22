/**
 * Created by Max Bilbow on 24/11/2015.
 */
define(['./pub-sub'], function ($ps) {



    var LogDecoder = function () {
        function tryParseJSON(data, desc) {
            try {
                $ps.info('Attempting to parse as JSON: ' + desc,data);
                return JSON.parse(data);
            } catch (e) {
                $ps.info('Could not parse data... ', e);
            }
        }
        $ps.info('LogDecoder initialized.');

        return {
            decode: function (evtData) {
                if (!evtData) {
                    throw new Error('Event data was undefined!');
                }
                var data = tryParseJSON(evtData,'evt.data');
                if (!data) {
                    $ps.info('failed to parse as JSON. Returning original...', evtData);
                    return evtData;
                }
                var log = data.body || data;
                $ps.info('Attempting to decode JSON: ',log);

                var result = '';


                var color = 'rgb(151, 253, 255)';
                if (log.logType)
                    switch (log.logType) {
                        case 'Warning':
                            color = 'rgb(255, 147, 40)';
                            break;
                        case 'Exception':
                            color = 'rgb(255, 46, 42)';
                            break;
                        case 'Info':
                            color = 'rgb(73, 255, 114)';
                            break;
                    }
                var time = new Date(log.timeStamp),
                    h = time.getHours(), // 0-24 format
                    m = time.getMinutes();
                result += (time = '' + h + ':' + m + ' ');

                result += '<strong>' + (log.sender || '') + '</strong> >> ';


                var spacer = '';
                for (var i = 0; i < time.length + 4; ++i) {
                    spacer += '&nbsp;';
                }
                var msg = log.message.replace(/\n|<br>/gi, '<br/>' + spacer);
                result += '<span style="color: ' + color + ';">' +
                    msg + '</span>';//.replace('\n','<br/>');
                return result;
            }
        };
    };
    return LogDecoder;
});