var convict = require('convict');

var conf = convict({
  server: {
    name: {
      doc: 'Server name',
      default: 'MongoDB Rest API'
    },
    host: {
      doc: 'Hostname of server',
      default: 'localhost'
    },
    port: {
      doc: 'Port of server',
      format: 'port',
      default: 27080
    },
    certificate: {
      doc: 'PEM-encoded certificate',
      default: ''
    },
    key: {
      doc: 'PEM-encoded key',
      default: ''
    }
  },
  db: {
    uri: {
      doc: 'URI to MongoDB database',
      default: 'mongodb://localhost:27017/test'
    }
  },
  etags: {
    doc: 'Enable auto generation on _etag property of docs',
    default: true
  },
  apiKeys: {
    doc: 'Array of valid API keys to access the API',
    default: []
  }
});

module.exports = conf;
