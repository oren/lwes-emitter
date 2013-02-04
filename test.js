var emit = require('./lwes.js');

var config = {
  port: 12345, 
  host: '127.0.0.1'
};

// "name": "YP::Mon::Perf",
// "RequesterIP": "127.0.0.1",

var data = {
 "aid": "push-service",
 "avid": "0.1",
 "eid": "where do i get the event id",
 "inreq": "/register",
 "method": "POST /register",
 "rid": "where do i get request id",
  "enc": ["1", "int16"],
  "code": ["200", "int32"],
  "rt_total": ["89", "int64"],

  "name1": "myService", 
  "req1": "myservice.foo.com/registration", 
   "code1": "201",
   "resp1": "{}",
   "rt1": "250"
};

emit(config, "performance-event", data);

