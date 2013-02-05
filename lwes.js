// module for emitting LWES events
//
// based on the C library - https://github.com/lwes/lwes
//
// usage:
// emit = require('./emit-lwes.js');
// var data = {
//   "name1": "pushService", 
//   "req1": "myservice.foo.com/registration", 
//   "code1": "201",
//   "resp1": "{}",
//   "rt1": "250"
// };
//
// emit({port: 12345, host: '127.0.0.1'}, "performance-event", data);


module.exports = emit;

var dgram = require('dgram');
var client = dgram.createSocket("udp4");
var buf = null;                  // will hold the buffer for sending
var offset = null;               // tracks the next position in the buffer to write to
var numOfAttributes = null;
var bufLength = null;            // estimating the required bytes for the buffer

var LWES_INT_16_TOKEN   = 0x02;
var LWES_INT_32_TOKEN   = 0x04;
var LWES_STRING_STRING  = 0x05;
var LWES_IP_ADDR_TOKEN  = 0x06;
var LWES_INT_64_TOKEN   = 0x07;

client.bind();
client.setMulticastTTL(128);

// Emit the LWES event
//
// type is a string
// data is a hash
//
// usage:
// emit("performance-event", {"code1": "201"});

function emit(config, data) {
  validateInput(arguments);
  offset = 0;
  numOfAttributes = 0;
  bufLength = 30;

  buf = buildEvent(config.type, data);
  sendUDP(buf, config.port, config.host);
};

// TBD
function validateInput(arguments) {
};

// Serializes the event into a buffer for transmission
//
// type is a string
// data is a hash
// 
// returns buffer
//
// Usage:
// buildEvent("performance", {"req1": "myservice.foo.com/registration", "code1"; "200"})

// Gory details:
// assumes the receiving side will handle integers as big endian.
// The C implementation acts differently, it maintains the OS endian,
// but node.js doesn't know the OS endian and only exposes an API
// that requires the code to pick between the two endian types.
//
// private

function buildEvent(type, data) {
  getNumOfAttributes();
  writeTypeAndAttNum();
  writeData();

  return buf;

  function getNumOfAttributes() {
    Object.keys(data).forEach(function(key) {
      numOfAttributes++;
      bufLength += (key.length + data[key].length + 8);
    });
  };

  // push the event type | corresponds to line 335 in lwes_event.c
  function writeTypeAndAttNum() {

    buf = new Buffer(bufLength);

    buf.writeUInt8(type.length, offset);
    offset++;
    offset += buf.write(type, offset);

    // push the number of attributes | corresponds to line 341 in lwes_event.c
    buf.writeUInt16BE(numOfAttributes, offset);    // push as big endian
    offset += 2;                                  // cause UInt16 is two bytes
  };

  function writeData() {
    Object.keys(data).forEach(function(key) {
      if (Array.isArray(data[key])) {
        writeNonString(key, data[key]);
      } else {
        writeString(key, data[key]);
      }
    });
  };
  
  // Write string to the buffer
  //
  // attribute and val are strings
  //
  // Usage:
  // writeString("code", "200");

  function writeString(attribute, val) {
    // write length of attribute (1 byte) 
    buf.writeUInt8(attribute.length, offset);
    offset++;

    // write attribute (string)
    offset += buf.write(attribute, offset);
    
    // write type of the value (1 byte). it's always writeUInt8
    buf.writeUInt8(LWES_STRING_STRING, offset);
    offset++;

    // write the number 0 (1 byte)
    buf.writeUInt8(0, offset);
    offset++;
    
    // write length of string value (1 byte)
    buf.writeUInt8(val.length, offset);
    offset++;

    // write value (string)
    offset += buf.write(val, offset);
  };

  // Write a non-string to the buffer
  //
  // attribute is string, val is an array of value and type
  //
  // Usage:
  // writeString("code", ["200", "int32"]);

  function writeNonString(attribute, val) {
    switch (val[1]) {
      case 'int16':
        writeint16(attribute, parseInt(val[0], 10));
        break;
      case 'int32':
        writeint32(attribute, parseInt(val[0], 10));
        break;
      case 'int64':
        writeint64(attribute, parseInt(val[0], 10));
        break;
      case 'ip':
        writeIp(attribute, val[0]);
        break;
      default:
        // code
    };
  };

  function writeint16(attribute, val) {
    // write length of attribute (1 byte) 
    buf.writeUInt8(attribute.length, offset);
    offset++;

    // write attribute (string)
    offset += buf.write(attribute, offset);

    // write type of the value (1 byte). it's always writeuint8
    buf.writeUInt8(LWES_INT_16_TOKEN, offset);
    offset++;

    // write int16 (2 bytes)
    buf.writeInt16BE(val, offset);
    offset += 2;
  };

  function writeint32(attribute, val) {
    // write length of attribute (1 byte) 
    buf.writeUInt8(attribute.length, offset);
    offset++;

    // write attribute (string)
    offset += buf.write(attribute, offset);

    // write type of the value (1 byte). it's always writeuint8
    buf.writeUInt8(LWES_INT_32_TOKEN, offset);
    offset++;

    // write int32 (4 bytes)
    buf.writeUInt32BE(val, offset);
    offset += 4;
  };

  function writeint64(attribute, val) {
    // write length of attribute (1 byte) 
    buf.writeUInt8(attribute.length, offset);
    offset++;

    // write attribute (string)
    offset += buf.write(attribute, offset);

    // write type of the value (1 byte). it's always writeuint8
    buf.writeUInt8(LWES_INT_64_TOKEN, offset);
    offset++;

    // write int64 (8 bytes)
    buf.writeDoubleBE(val, offset);
    offset += 8;
  };

  function writeIp(attribute, val) {
    val = val.split('.').map(function(x){
      return parseInt(x, 10);
    });

    // write length of attribute (1 byte) 
    buf.writeUInt8(attribute.length, offset);
    offset++;

    // write attribute (string)
    offset += buf.write(attribute, offset);

    // write type of the value (1 byte). it's always writeuint8
    buf.writeUInt8(LWES_IP_ADDR_TOKEN, offset);
    offset++;

    // write uint8 (1 byte)
    buf.writeUInt8(val[3], offset);
    offset ++;
    // write uint8 (1 byte)
    buf.writeUInt8(val[2], offset);
    offset ++;
    // write uint8 (1 byte)
    buf.writeUInt8(val[1], offset);
    offset ++;
    // write uint8 (1 byte)
    buf.writeUInt8(val[0], offset);
    offset ++;
  };
};

// Send the UDP packet
// 
// message is a buffer
// port is a number
// host is a string
//
// Usage:
// sendUDP(myBuffer, 12344, "127.0.0.1")
//
// private

function sendUDP(message, port, host) {
  client.on('error', function(e) {
    console.log('Error in sending UPD', e);
  });

  try {
    client.send(message, 0, offset, port, host, delivered);
  } catch(e) {
    console.log('Error in sending UDP', e);
  };

  function delivered(err, bytes) {
    if(err) {
      console.log("Error in the delivery of UDP: ", err);
    } else {
      console.log("LWES event was sent");
    };
  };
};
