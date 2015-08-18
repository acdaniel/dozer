var convict = require('convict');

var conf = convict({
  server: {
    name: {
      doc: 'Server name',
      format: String,
      default: 'MongoDB Rest API'
    },
    host: {
      doc: 'Hostname of server',
      format: String,
      default: 'localhost'
    },
    port: {
      doc: 'Port of server',
      format: 'port',
      default: 27080
    },
    certificate: {
      doc: 'Path PEM-encoded certificate',
      format: '*',
      default: null
    },
    key: {
      doc: 'Path PEM-encoded key',
      format: '*',
      default: null
    }
  },
  db: {
    uri: {
      doc: 'URI to MongoDB database',
      format: String,
      default: 'mongodb://localhost:27017/test'
    }
  },
  auth: {
    enabled: {
      doc: 'Enable API key authentication',
      format: Boolean,
      default: false
    },
    allowLocal: {
      doc: 'Allow local connections without authentication',
      format: Boolean,
      default: true
    },
    apiKeys: {
      doc: 'Map of api keys and secrets',
      format: Object,
      default: {}
    }
  },
  memoize: {
    maxAge: {
      doc: 'Set period, in milliseconds, to clear cached result',
      format: Number,
      default: 0
    }
  }
});

module.exports = conf;
