var emit = require('./lwes.js');

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
  "rt_total": ["89", "int64"],
  "RequesterIP": ["127.0.0.1", "ip"],

  "name1": "myService", 
  "req1": "myservice.foo.com/registration", 
   "code1": "201",
   "resp1": "{}",
   "rt1": "250"
};

emit(config, data);

