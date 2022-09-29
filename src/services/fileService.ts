import { _api } from '../nodeWatcher';
import BN from 'bn.js';
import { CAPACITY_BASE_UNIT, convertBN } from '../util';
const axios = require('axios');

const DEFAULT_FILE_PRICE = 0.000001;

const config = {
  method: 'get',
  url: 'https://api.coincap.io/v2/assets/crust',
  headers: { }
};

const subscanQueryData = JSON.stringify({"row":1,"page":0});

const subscanConfig = {
  method: 'post',
  url: 'https://crust.api.subscan.io/api/scan/swork/orders',
  headers: { 
    'Content-Type': 'application/json', 
    'X-API-Key': '5962d7416ae2a5eaf4de837972c11606'
  },
  data : subscanQueryData
};

const DEFAULT_ORDER_COUNT = 288705

export const filePrice = async () => {
    const api = await _api.isReadyOrError;
    const fileBaseFee = await api.query.market.fileBaseFee();
    // 每m每6个月
    const fileByteFee = await api.query.market.fileByteFee();
    const fileKeysCountFee = await api.query.market.fileKeysCountFee();
    try {
        const filePrice = new BN(fileByteFee.toString()).muln(1024).add(new BN(fileBaseFee.toString())).add(new BN(fileKeysCountFee.toString())).muln(2)
        const cruAssetsResponse = await axios(config);
        const data = cruAssetsResponse?.data?.data
        const usdPrice = filePrice.muln(Number(data?.priceUsd))
        return usdPrice.toNumber() / 1000000000000.0
    } catch (error) {
        console.log(error)
        return DEFAULT_FILE_PRICE
    }

}

export const fileOrderPrice = async (fileSize: any) => {
  const api = await _api.isReadyOrError;
  // query file base fee
  const fileBaseFee = await api.query.market.fileBaseFee();
  // query file byte fee (per mb per half year)
  const fileByteFee = await api.query.market.fileByteFee();
  // query file keys count fee
  const fileKeysCountFee = await api.query.market.fileKeysCountFee();
  const fileMbSize = convertBN(fileSize).div(new BN(CAPACITY_BASE_UNIT)).div(new BN(CAPACITY_BASE_UNIT));
  try {
    // file price = (file byte fee * file size) + file base fee + file keys count fee
    const filePrice = new BN(fileByteFee.toString()).mul(fileMbSize)
    .add(new BN(fileBaseFee.toString())).add(new BN(fileKeysCountFee.toString()));
    // balance to number
    return filePrice.toNumber() / 1000000000000.0
  } catch (error) {
      console.log(error)
      return fileMbSize.muln(DEFAULT_FILE_PRICE).toNumber()
  }
}

export const orderCount = async () => {
    try {
        const orderInfoResponse = await axios(subscanConfig);
        const orderCount = orderInfoResponse?.data?.data?.count
        return orderCount
    } catch (error) {
        return DEFAULT_ORDER_COUNT;
    }
}