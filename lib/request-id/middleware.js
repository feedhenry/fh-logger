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
var uuid = require('node-uuid');
var cls = require('continuation-local-storage');
var namespace = require('../const').namespace;

/**
 * Builds an express middleware that inserts the requestId in the request
 * and stores it for use in other logger invocations
 *
 * Should be `use`d near the start of the middleware chain
 * @param  {Object} config Logger configuration, uses config.requestIdHeader as the header key for the requestId
 * @return {Function}        Express.js middleware
 */
module.exports = function(config) {
  var header = config.requestIdHeader || 'X-FH-REQUEST-ID';
  var middleware = function(req, res, next) {
    var id = req.header(header) || uuid.v4();
    var ns = cls.createNamespace(namespace);
    ns.bindEmitter(req);
    ns.bindEmitter(res);
    ns.run(function() {
      ns.set('requestId', id);

      // also insert the request id in the Request object for convenience
      // and access by other modules
      req.requestId = id;

      return next();
    });
  };
  middleware.header = header;
  return middleware;
};
