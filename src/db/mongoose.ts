import { dbEndpoint } from '../env';
import { logger } from '@polkadot/util';

const l = logger('mongoose-config');

const mongoose = require('mongoose');
/**
 *  connect
 */
const DB_URL = dbEndpoint;

mongoose.connect(DB_URL, {
  poolSize: 10,
  bufferMaxEntries: 0,
  reconnectTries: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/**
 *  connect success
 */
mongoose.connection.on('connected', () => {
    l.log('Mongoose connection open to ' + DB_URL);
});

/**
 *  connect error
 */
mongoose.connection.on('error', (err: any) => {
    l.error('Mongoose connection error: ' + err);
    process.exit(1);
});

/**
 *  disconnected
 */
mongoose.connection.on('disconnected', () => {
    l.log('Mongoose connection disconnected');
    process.exit(1);
});

export = mongoose;
