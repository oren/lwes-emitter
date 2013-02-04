# lwes-emitter

Module for emitting UDP packets for [Light Weight Event System](http://www.lwes.org/).  
No dependencies or calling external C libraries, just using Node.js.

    emit = require('lwes-emitter');

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


## Install

    npm install lwes-emitter

## Listen to events

Install the [LWES C library](https://github.com/lwes/lwes) on your machine and run:

    lwes-event-printing-listener -m 127.0.0.1

You should see this output:

    performance-event[17]
    {
      SenderPort = 53981;
      inreq = /register;
      rid = where do i get request id;
      enc = 1;
      name1 = myService;
      code = 200;
      rt_total = 4635963235168681984;
      rt1 = 250;
      aid = push-service;
      code1 = 201;
      method = POST /register;
      ReceiptTime = 1359957507423;
      eid = where do i get the event id;
      SenderIP = 127.0.0.1;
      req1 = myservice.foo.com/registration;
      resp1 = {};
      avid = 0.1;
    }

