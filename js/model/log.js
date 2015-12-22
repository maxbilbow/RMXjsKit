/**
 * Created by Max Bilbow on 23/11/2015.
 * TODO: Make this useful
 */
define(['model/cookies','service/pub-sub'],function($c,$ps){


   var Log = function(msg){

       var user = $c.get('username');
       if (!user) {
           $c.set('username',"unknown user", $c.expire);
       }
       return (function($this)
       {
           $ps.info('A new log was created',$this);
           return $this;
       })({
           id: null,
           logType: 'Message',
           channel: 'debug.info',
           message: msg | '',
           timestamp: +new Date(),
           sender: user
       });
   }

    return Log;
});