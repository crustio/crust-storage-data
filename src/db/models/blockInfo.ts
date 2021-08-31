import mongoose from '../mongoose';

const Schema = mongoose.Schema;

// [RAW] record sync to which block
const blockInfo = new Schema({
  blockNumber: {type: Number, index: true, unique: true},
});

export = mongoose.model('BlockInfo', blockInfo, 'BlockInfo');
