/**
 * Created by Max Bilbow on 23/11/2015.
 */

define(['jquery', 'service/pub-sub','service/terminal'], function ($, ps, DefaultTerminal) {
    var webConsoles = [];


    var getConsoleView = function () {

        var view = $('.web-console');

        if (view.length > 0) {
            if (view.html()) {
                ps.info(view.html());
                ps.info('Web Console view already exists');
                return view;
            }
            ps.info('Web Console view exists but is empty. Generating...');
        } else {
            //else append view to body
            ps.info('Generating NEW WebConsoleView');
            view = $(document.createElement('div'))
                .addClass('container').addClass('web-console')
                .appendTo('body');
        }


        view.addClass('hero-unit')
            .append(
                    $(document.createElement('div'))
                        .addClass('wc-output')
                ).append(
                $(document.createElement('div'))
                    .addClass('wc-input').addClass('row-fluid')
                    .append($(document.createElement('input'))
                        .addClass('span10').addClass('wc-message')
                        .css('float','left')
                        .attr('type', 'text').val('help')
                    )
                    .append($(document.createElement('span'))
                        .addClass('btn').addClass('btn-primary')
                        .addClass('span2').addClass('wc-send')
                        .html('Send')
                    )
            );
        return view;

    };

    var WebConsole = function (inputField, outputField) {
        var history = [], sentHistory = [],
            fwdHistory = [],
            filters = [],
            validators = [],
            completionHandlers = [];

        var last = '';
        var input, output;



        return (function ($this) {

            output = outputField || $this.view.find('.wc-output');
            $this.input(inputField || $this.view.find('.wc-message'));
            $this.onValidate(function () {
                if ($this.inputText().length == 0) {
                    return 'Message cannot be empty!';
                }
            });
            ps.sub(ps.INFO, function (msg) {
                if ($this.debugLevel === ps.INFO) {
                    $this.print(msg, 'color: grey;');
                }
            }).sub(ps.WARN, function (msg) {
                if ($this.debugLevel === ps.INFO || $this.debugLevel === ps.WARN) {
                    $this.warn(msg);
                }
            }).sub(ps.ERROR, function (msg) {
                if ($this.debugLevel && $this.debugLevel !== 'false') {
                    $this.error(msg);
                }
            });
            $this.view.find('.wc-send').click(function () {
                $this.submit();
            });
            $this.terminal = new DefaultTerminal($this);
            return $this;
        })({
            id: webConsoles.length, debugLevel: ps.NONE, view : $(getConsoleView()),
            terminal:null,
            onComplete: function (callback) {
                completionHandlers.push(callback);
            },
            onValidate: function (callback) {
                validators.push(callback);
            },
            onFilter: function (callback) {
                filters.push(callback);
            },
            output: function (aOutput) {
                if (aOutput) {
                    output = aOutput;
                } else {
                    return output;
                }
            }, onError: function (e) {
                ps.error(e);
            }, stepBack: function () {
                var txt = this.input().val();

                if (history.length > 0) {
                    if (txt.length > 0) {
                        if (fwdHistory.length == 0 || fwdHistory[fwdHistory.length - 1] !== txt)
                            fwdHistory.push(txt);
                    }
                    this.inputText(history.pop());
                }
                ps.info(history + ' --- ' + this.inputText() + ' --- ' + fwdHistory);
            }, stepForward: function () {
                var txt = this.inputText();
                if (txt.length > 0) {
                    if (history.length == 0 || history[history.length - 1] !== txt)
                        history.push(txt);
                }
                if (fwdHistory.length > 0) {
                    this.inputText(fwdHistory.pop());
                } else {
                    this.inputText('');
                }
                ps.info(history + ' +++ ' + this.inputText() + ' +++ ' + fwdHistory);
            }, pushCmd: function() {
                last = this.inputText();
                if (sentHistory.length == 0 ||
                    sentHistory[sentHistory.length - 1] !== last) {
                    sentHistory.push(last);
                }
                fwdHistory = [];
                history = sentHistory.slice(0);
                this.inputText('');
            }
            , submit: function () {
                if (this.terminal &&
                    this.terminal.process(this.inputText()) == true) {
                    this.pushCmd();
                    return;
                }
                for (var i = 0; i < validators.length; ++i) {
                    var error;
                    if (error = validators[i](this.input())) {
                        this.onError(error);
                        return false;
                    }
                }
                var success;
                try {
                    this.pushCmd();
                    success = this.onSubmit(last);
                } catch (e) {
                    success = false;
                    this.onError(e);
                } finally {
                    for (var i = 0; i < completionHandlers.length; ++i) {
                        completionHandlers[i](success);
                    }
                }
            }
            , input: function (aInput) {
                if (aInput) {
                    input = aInput;
                    var $this = this;
                    input.keyup(function (evt) {
                        evt.preventDefault();
                        switch (evt.keyCode) {
                            case 13: //return
                                $this.submit();
                                break;
                            case 38: //up arrow
                                $this.stepBack();
                                break;
                            case 40: //down arrow
                                $this.stepForward();
                                break;
                        }
                    });
                } else {
                    return input;
                }
            },
            print: function (msg, prefix, style) {
                if (style === undefined) { //If color not given, assume prefix is color.
                    style = prefix;
                    prefix = null;
                }
               msg = msg.replace(/\n|<br>/gi, '<br/>')
                   .replace(/  /g, '&nbsp ');
                var html = '<span style="' +
                    (style || '') + '"> ' +
                    (prefix || msg ) + ' </span>' +
                    (prefix ? msg : '');
                this.output().append($(document.createElement('p')).html(html));
                this.output().scrollTop(this.output()[0].scrollHeight);
            }, log: function (msg, prefix, style) {
                this.print(msg, prefix || '>> ', style || 'color: rgb(151, 253, 255);');
            },
            error: function (msg, prefix, style) {
                this.print(msg, prefix || 'ERROR >> ', style || 'color: rgb(255, 46, 42);');
            },
            warn: function (msg, prefix, style) {
                this.print(msg, prefix || 'WARNING >> ', style || 'color: rgb(255, 188, 91);');
            },
            success: function (msg) {
                this.green(msg)
            },
            fail: function (msg) {
                this.print(msg, 'FAIL >> ', 'color: rgb(255, 46, 42);')
            },
            green: function (msg, prefix) {
                this.print(msg, prefix, 'color: rgb(152, 255, 183);')
            },
            orange: function (msg, prefix) {
                this.print(msg, prefix, 'color: rgb(255, 188, 91);')
            },
            red: function (msg, prefix) {
                this.print(msg, prefix, 'color: rgb(255, 46, 42);')
            },
            inputText: function (val) {
                if (val || val === '')
                    this.input().val(val);
                return this.input().val();
            }, onSubmit: function (text) {
                this.print('<i>Sent: ' + text + '</i>');
            }, last: function () {
                return last;
            }, getHistory: function () {
                return history
            },
            getFwdHistory: function () {
                return fwdHistory
            }
        });
    };

    return {
        getInstance: function (id) {
            if (id) {
                for (var i = 0; i < webConsoles.length; ++i) {
                    if (webConsoles[i].id === id) {
                        return webConsoles[i];
                    }
                }
                var wc = new WebConsole();
                wc.id = id;
                webConsoles.push(wc);
                return wc;
            } else if (webConsoles.length > 0) {
                return webConsoles[0];
            } else {
                var wc = new WebConsole();
                webConsoles.push(wc);
                return wc;
            }
        },
        newInstance: function (id) {
            if (id) {
                for (var i = 0; i < webConsoles.length; ++i) {
                    if (webConsoles[i].id === id) {
                        //webConsoles[i] = new WebConsole();
                        //webConsoles[i].id = id;
                        return webConsoles[id];
                    }
                }
            } else {
                var wc = new WebConsole();
                webConsoles.push(wc);
                return wc;
            }
        }
    };

});