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
var expect = require('chai').expect;
var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;
var requestIdMiddleware = require('../lib/request-id/middleware');
var cls = require('continuation-local-storage');
var namespace = require('../lib/const').namespace;
var logger = require('../lib/fh_logger');

describe('request-id middleware', function() {
  var customHeader = 'X-CUSTOM-REQUEST-ID';
  var cfg = {
    requestIdHeader: customHeader
  };

  var mockReqId = 'some-uuid';

  var mockReq = new EventEmitter();
  mockReq.header = function() {
    return mockReqId;
  };

  before(function() {
    this.middleware = requestIdMiddleware(cfg);
  });
  it('should accept a header config', function() {
    expect(this.middleware.header).to.equal(customHeader);
  });
  it('should populate the request id', function(done) {
    var setHeaderSpy = sinon.spy();

    var mockRes = {
      set: setHeaderSpy
    };


    this.middleware(mockReq, mockRes, function next() {
      var ns = cls.getNamespace(namespace);
      expect(ns.get('requestId')).to.equal(mockReqId);
      expect(logger.createLogger({name: 'test'}).getRequestId()).to.equal(mockReqId);

      //The response headers should have been set.
      sinon.assert.calledOnce(setHeaderSpy);
      sinon.assert.calledWith(setHeaderSpy, sinon.match(customHeader), sinon.match(mockReqId));

      done();
    });
  });
});