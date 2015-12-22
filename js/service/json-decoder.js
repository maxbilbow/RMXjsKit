/**
 * Created by Max Bilbow on 24/11/2015.
 */
define(['./pub-sub'], function ($ps) {



    var JsonDecoder = function () {
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
                    throw new Error('Event data was undefined!'); //Todo: Why cant this just return the input?
                }
                var data = tryParseJSON(evtData,'evt.data');
                if (!data) {
                    $ps.info('failed to parse as JSON. Returning original...', evtData);
                    return evtData;
                }
                var json = data.body || data;
                $ps.info('Attempting to decode JSON: ',json);


                var result = 'JSON DATA:  ';

                for (var key in json) {
                    if (json.hasOwnProperty(key)) {
                        result += '<span class="decoded-json" id="'+key+'">' + key + ': ' + json[key]+'</span>. ';
                    }
                }
                return result;
            }
        };
    };
    return JsonDecoder;
});