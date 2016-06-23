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
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var requestIdMiddleware = require('../lib/request-id/middleware');
var cls = require('continuation-local-storage');
var namespace = require('../lib/const').namespace;

describe('request-id middleware', function() {
  var customHeader = 'X-CUSTOM-REQUEST-ID';
  var cfg = {
    requestIdHeader: customHeader
  };

  var mockReq = new EventEmitter();
  mockReq.header = function() {
    return 'some-uuid';
  }

  before(function() {
    this.middleware = requestIdMiddleware(cfg);
  });
  it('should accept a header config', function() {
    expect(this.middleware.header).to.equal(customHeader);
  });
  it('should populate the request id', function(done) {
    this.middleware(mockReq, new EventEmitter(), function next() {
      var ns = cls.getNamespace(namespace);
      expect(ns.get('requestId')).to.equal('some-uuid');
      done();
    });
  });
});