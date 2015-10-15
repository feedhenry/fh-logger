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
var bunyan = require('bunyan');
var cluster = require('cluster');

module.exports.createLogger = function(loggerConfig) {
  var config = parseConfig(loggerConfig);
  configureStreams(config);
  configureSerializers(config);
  return bunyan.createLogger(config);
}

function parseConfig(loggerConfig) {
  return typeof loggerConfig === 'string' ? JSON.parse(loggerConfig) : loggerConfig;
}

function configureStreams(config) {
  if (config.streams) {
    var len = config.streams.length;
    for (var i = 0; i < len; i++) {
      var stream = config.streams[i];
      switch (stream.type) {
        case 'raw':
          stream.stream = new bunyan.RingBuffer({
            limit: config.ringBufferLimit || 200
          });
          break;
        case 'stream':
          switch (stream.stream) {
            case 'process.stdout':
              stream.stream = process.stdout;
              break;
            case 'process.stderr':
              stream.stream = process.stderr;
              break;
            default:
              stream.stream = eval(stream.stream);
          }
          break;
        case 'file':
          stream.stream = stream.file;
          break;
      }
    }
  }
}

function configureSerializers(config) {
  config.serializers = {
    req: requestSerializer
  };
}

var requestSerializer = function(req) {
  if (req) {
    return {
      reqId: req.id,
      method: req.method,
      url: req.url,
      worker: cluster.worker? cluster.worker.id: -1
    }
  }
  return {}
}
