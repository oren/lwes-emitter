# lwes-emitter

Module for emitting UDP packets for [Light Weight Event System](http://www.lwes.org/).  
No dependencies or calling external C libraries, just using Node.js.

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

## Install

    npm install lwes-emitter

## Listen to events

### Using C

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

### Using Ruby

    require 'lwes'
     
    listener = LWES::Listener.new :address => "224.100.100.1", :port => 4455
      
    # either do recv to print the first event it sees or each do loop through all events
    listener.recv
       
    #listener.each do |event|
    #  puts event
    #end
