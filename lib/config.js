var convict = require('convict');

var conf = convict({
  server: {
    name: {
      doc: 'Server name',
      format: String,
      default: 'MongoDB Rest API',
      env: 'DOZER_SERVER_NAME'
    },
    host: {
      doc: 'Hostname of server',
      format: String,
      default: '',
      env: 'DOZER_SERVER_HOST'
    },
    port: {
      doc: 'Port of server',
      format: 'port',
      default: 27080,
      env: 'DOZER_SERVER_PORT'
    },
    certificate: {
      doc: 'Path to PEM-encoded certificate',
      format: '*',
      default: null,
      env: 'DOZER_SERVER_CERT'
    },
    key: {
      doc: 'Path to PEM-encoded key',
      format: '*',
      default: null,
      env: 'DOZER_SERVER_KEY'
    }
  },
  db: {
    uri: {
      doc: 'URI to MongoDB database',
      format: String,
      default: 'mongodb://localhost:27017/test',
      env: 'DOZER_SERVER_DB'
    }
  },
  auth: {
    enabled: {
      doc: 'Enable API key authentication',
      format: Boolean,
      default: false,
      env: 'DOZER_SERVER_AUTH_ENABLED'
    },
    secret: {
      doc: 'Secret used to validate web tokens',
      format: String,
      default: '',
      env: 'DOZER_SERVER_AUTH_SECRET'
    },
    issuer: {
      doc: 'Name of the issuer of the web token',
      format: String,
      default: 'MongoDB Rest API',
      env: 'DOZER_SERVER_AUTH_ISS'
    },
    algorithm: {
      doc: 'Algorithm used to sign token',
      format: String,
      default: 'HS256',
      env: 'DOZER_SERVER_AUTH_ALGO'
    },
    blacklist: {
      doc: 'Array of token ids that have been revoked',
      format: Array,
      default: []
    }
  }
});

module.exports = conf;
