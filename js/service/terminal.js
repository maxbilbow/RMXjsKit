/**
 * Created by Max Bilbow on 25/11/2015.
 */
define(['./pub-sub'],function ($ps) {
    var DefaultTerminal = function (webConsole) {
        var FN = 0, DESC = 1;


        /**
         *
         * @type {{echo: computers.echo}} returns true if the command was accepted
         */
        var computers = {
            echo:[function(cmd,txt){
                webConsole.log(txt, 'ECHO: ');
                return true;
            },'Echo command'],
            help:[function(cmd,txt){
                var cmds = '\nClient-side Commands:';
                var keys = Object.keys(computers);
                for (var i=0;i<keys.length;++i)
                    cmds += '\n   ' + keys[i] + ': ' + computers[keys[i]][DESC];
                webConsole.log(cmds,'HELP: ');
            },'Display available commands'],
            func:[function(cmd,txt){
                var name = cmd[1];
                var split = 2;
                var desc = 'custom function';
                var response = cmd.slice(split).join(' ');
                webConsole.log(txt, 'NEW FUNC: ');
                computers[name] = [function (cmd,txt) {
                    try {
                        txt = new Function('args','text',response)(cmd.splice(1),txt);
                    } catch (e) {
                        txt = response + ': ' + e;
                    }
                    if (txt)
                        webConsole.log(txt, cmd[0] + ': ');
                    return true;
                },desc];
                return true;
            },'Create a new js function. parameters are Array args, String text, WebConsole $this.' +
            '\n    e.g. "/func testA return \'IT WORKED!  \' + args.length + \' words in: \' + text;"' +
            '\n         "/func testB $this.log(\'IT WORKED!  \' + args.length + \' words in: \' + text);"']
        };

        return {
            cmdKey:null,console: webConsole || document.console,
            /**
             *
             * @param cmd
             * @returns {boolean} true if a command was accepted
             */
            process: function (txt) { //Returns false if no command was received
                if (txt && txt !== "") {
                    if (this.expectsReply && this.onReply) {
                        this.expectsReply = false;
                        this.onReply.call(this,txt,this); //process reply
                        return true;
                    } else if (!this.cmdKey || txt[0] === this.cmdKey) {
                        $ps.info('Received command: ' + txt);
                        var cmd = (this.cmdKey ? txt.substring(this.cmdKey.length) : txt).split(' ');
                        var process = computers[cmd[0].toLowerCase()];
                        if (process) {
                            return process[FN].call(this,cmd, cmd.slice(1).join(' '));//, this);
                        } else {
                            return false;
                        }
                    }
                }
                return false;

            },
            /**
             * Add a processor for a given command
             * @param key
             * @param processor
             */
            onProcess: function (key,processor,desc) {
                computers[key.toLowerCase()] = [processor, desc || 'new custom processor'];
            },
            /**
             * this.expectsReply was set to false before this method is called.
             * If the reply is not satisfactory, it can be set back to true
             * with $this.expectsReply = true;
             * @param txt
             * @param $this
             *
             */
            onReply: function(txt,$this){
                $ps.warn('onReply was not set:' + txt);
            },
            expectsReply: false
        }
    };
    return DefaultTerminal;
});

