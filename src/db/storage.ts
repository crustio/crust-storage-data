import { StorageInfo } from './models';
import { parseObj } from '../util';
import { StorageInfo as DBStoage } from '../services/historyService';

export const saveStorageInfo = async (storage: DBStoage) => {
    const storageSchema = new StorageInfo(parseObj(storage));
    storageSchema.save();
};

export const storageList = async () => {
    return StorageInfo.find().sort({
        date: -1
    }).skip(0).exec()
};
