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
  auth: {
    enabled: {
      doc: 'Enable API key authentication',
      default: false
    },
    allowLocal: {
      doc: 'Allow local connections without authentication',
      default: true
    },
    apiKeys: {
      doc: 'Map of api keys and secrets',
      default: {}
    }
  },
  memoize: {
    maxAge: {
      doc: 'Set period, in milliseconds, to clear cached result',
      default: 0
    }
  }
});

module.exports = conf;
