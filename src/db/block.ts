import { BlockInfo } from './models';

export const saveBlockNumber = (bn: number) => {
  const blockNumber = new BlockInfo({
    blockNumber: bn,
  });
  blockNumber.save();
};

export const latestBlockFromDb = async () => {
  return BlockInfo.findOne({}).sort({'blockNumber': -1}).limit(1).exec();
};

export const upsertBlockNumber = async (bn: number) => {
  const blockInDb = await latestBlockFromDb();
  if (blockInDb) {
    BlockInfo.updateOne({_id: blockInDb._id}, {blockNumber: bn}).exec();
  } else {
    saveBlockNumber(bn);
  }
};
