/*
 JBoss, Home of Professional Open Source
 Copyright Red Hat, Inc., and individual contributors.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var fh_logger = require('../lib/fh_logger.js');
var expect = require('chai').expect
var bunyan = require('bunyan'); 
var fs = require('fs');

describe('fh_logger.createLogger', function() {

    describe('with Bunyan defaults', function() {
      var logger;
      before(function(){
        logger = fh_logger.createLogger({name: 'simple'});
      })
      it('name should have been set to simple', function() {
        expect(logger.fields.name).to.equal('simple');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('type should be stream', function() {
        expect(logger.streams[0].type).to.equal('stream');
      });
      it('log level should be INFO', function() {
        expect(logger.streams[0].level).to.equal(bunyan.INFO);
      });
      it('stream should be process.stdout', function() {
        expect(logger.streams[0].stream).to.equal(process.stdout);
      });
    });

    describe('using file type', function() {
      var logFile = './test/test_fh_logger.log';
      var logger;
      before(function(){
        var config = {name: 'file_logger', streams: [
          {type: 'file', stream: 'file', path: logFile, level: 'info'}
        ]};
        logger = fh_logger.createLogger(config);
      })
      it('name should have been set to file_logger', function() {
        expect(logger.fields.name).to.equal('file_logger');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('type should be file', function() {
        expect(logger.streams[0].type).to.equal('file');
      });
      it('log level should be INFO', function() {
        expect(logger.streams[0].level).to.equal(bunyan.INFO);
      });
      it('path should be '  + logFile, function() {
        expect(logger.streams[0].path).to.equal(logFile);
      });
    });

    describe('using file type from string configuration', function() {
      var logFile = './test/test_fh_logger_string.log';
      var logger;
      before(function(){
        var config = JSON.stringify({name: 'file_logger_string', streams: [
          {type: 'file', stream: 'file', path: logFile, level: 'debug'}
        ]});
        logger = fh_logger.createLogger(config);
      })
      it('name should have been set to file_logger_string', function() {
        expect(logger.fields.name).to.equal('file_logger_string');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('type should be file', function() {
        expect(logger.streams[0].type).to.equal('file');
      });
      it('log level should be DEBUG', function() {
        expect(logger.streams[0].level).to.equal(bunyan.DEBUG);
      });
      it('path should be '  + logFile, function() {
        expect(logger.streams[0].path).to.equal(logFile);
      });
      it('logger.debug should generate entry in logFile'  + logFile, function() {
        logger.debug("Dummy log statement");
        fs.readFile(logFile, 'utf-8', function(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.defined;
          deleteFile(logFile);
        });
      });
    });

    describe('using process.stdout from string configuration', function() {
      var logger;
      before(function(){
        var config = JSON.stringify({name: 'from_string_stdout', streams: [
          {type: 'stream', stream: 'process.stdout', level: 'debug'}
        ]});
        logger = fh_logger.createLogger(config);
      })
      it('name should have been set to from_string_stdout', function() {
        expect(logger.fields.name).to.equal('from_string_stdout');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('type should be stream', function() {
        expect(logger.streams[0].type).to.equal('stream');
      });
      it('stream should be process.stdout', function() {
        expect(logger.streams[0].stream).to.equal(process.stdout);
      });
      it('log level should be DEBUG', function() {
        expect(logger.streams[0].level).to.equal(bunyan.DEBUG);
      });
    });

    describe('using raw ringbuffer.stdout from string configuration', function() {
      var logger;
      before(function(){
        var config = JSON.stringify({name: 'from_string_raw', streams: [
          {type: 'raw', stream: 'ringbuffer', level: 'trace'}
        ]});
        logger = fh_logger.createLogger(config);
      })
      it('name should have been set to from_string_raw', function() {
        expect(logger.fields.name).to.equal('from_string_raw');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('type should be raw', function() {
        expect(logger.streams[0].type).to.equal('raw');
      });
      it('log level should be TRACE', function() {
        expect(logger.streams[0].level).to.equal(bunyan.TRACE);
      });
      it('logger.trace should generate a log record', function() {
        logger.trace("Raw trace log statement");
        var record = logger.streams[0].stream.records[0];
        expect(record.name).to.be.equal("from_string_raw");
        expect(record.msg).to.be.equal("Raw trace log statement");
      });
    });

    describe('using raw ringbuffer.stdout from string configuration', function() {
      var logger;
      before(function(){
        var config = JSON.stringify({name: 'test_stderr', streams: [{
          stream: 'process.stderr', type: 'stream'}
        ]});
        logger = fh_logger.createLogger(config);
      })
      it('name should have been set to test_stderr', function() {
        expect(logger.fields.name).to.equal('test_stderr');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('type should be stream', function() {
        expect(logger.streams[0].type).to.equal('stream');
      });
      it('stream should be process.stderr', function() {
        expect(logger.streams[0].stream).to.be.equal(process.stderr);
      });
      it('log level should be INFO', function() {
        expect(logger.streams[0].level).to.equal(bunyan.INFO);
      });
    });

    describe('from ./test/config.json', function() {
      var logger;
      before(function(){
        var config = fs.readFileSync(__dirname + '/config.json').toString();
        logger = fh_logger.createLogger(config);
      })
      it('name should have been set to test_stderr', function() {
        expect(logger.fields.name).to.equal('testing');
      });
      it('serializers should have be set', function() {
        expect(logger.serializers).to.be.defined;
      });
      it('should have three streams', function() {
        expect(logger.streams.length).to.equal(3);
      });
      it('first stream should be of type file', function() {
        expect(logger.streams[0].type).to.equal('file');
      });
      it('first stream level should be DEBUG', function() {
        expect(logger.streams[0].level).to.equal(bunyan.DEBUG);
      });
      it('first stream path should be ./test/test.log', function() {
        expect(logger.streams[0].path).to.equal('./test/test.log');
      });
      it("logging at DEBUG level should generate entry in ./test/test.log", function() {
        logger.debug("From file config");
        fs.readFile(logger.streams[0].path, 'utf-8', function(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.defined;
          deleteFile(logger.streams[0].path);
        });
      });
      it('second stream should be of type stream', function() {
        expect(logger.streams[1].type).to.equal('stream');
      });
      it('second stream level should be DEBUG', function() {
        expect(logger.streams[1].level).to.equal(bunyan.DEBUG);
      });
      it('second stream should be process.stdout', function() {
        expect(logger.streams[1].stream).to.equal(process.stdout);
      });
      it('third stream should be of type raw', function() {
        expect(logger.streams[2].type).to.equal('raw');
      });
      it('third stream level should be TRACE', function() {
        expect(logger.streams[2].level).to.equal(bunyan.TRACE);
      });
    });
});

var deleteFile = function(file) {
  fs.exists(file, function(exists) {
    if (exists) {
      fs.unlink(file, function(err) {
        if (err && err.code != 'ENOENT') {
          throw err;
        }
      });
    }
  });
}

