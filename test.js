var lwes = require('./lwes.js');

var config = {
  type: 'performance-event',
  port: 12345, 
  host: '127.0.0.1'
};

var data = {
 "aid": "push-service",
 "avid": "0.1",
 "eid": "event-889",
 "inreq": "/register",
 "method": "POST /register",
 "rid": "request-123",
  "enc": ["1", "int16"],
  "code": ["200", "int32"],
  "rt_total": "89",
  "RequesterIP": ["127.0.0.1", "ip"],

  "name1": "myService", 
  "req1": "myservice.foo.com/registration", 
   "code1": "201",
   "resp1": "{}",
   "rt1": "250"
};

// lwes is an event emitter

lwes.on('data', function(data) { 
  console.log('LWES data event.', data);
});

lwes.on('error', function(err) { 
  console.log('LWES error event.', err);
});

// but it also allow passing a callback

function sent(err, bytes) {
  if (err) {
    console.log('error', err);
  } else {
    console.log('LWES was sent');
  }
};

// the last argument, the callback, in optional
lwes.send(config, data, sent);



