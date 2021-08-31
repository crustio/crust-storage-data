import mongoose from '../mongoose';

const Schema = mongoose.Schema;

const storageInfo = new Schema({
  totalStorage: { type: Number, index: true },
  totalPeers: { type: Number, index: true},
  date: { type: Number, index: true, unique: true}
});

export = mongoose.model('StorageInfo', storageInfo, 'StorageInfo');
