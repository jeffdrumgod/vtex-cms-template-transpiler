const HttpServer = require('./src/http-server');

module.exports = (options) => {
  return HttpServer(options);
};
