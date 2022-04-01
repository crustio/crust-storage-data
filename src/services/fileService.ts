import { _api } from '../nodeWatcher';
import BN from 'bn.js';
const axios = require('axios');

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
        const filePrice = new BN(fileByteFee.toString()).muln(512).add(new BN(fileBaseFee.toString())).add(new BN(fileKeysCountFee.toString()))
        const cruAssetsResponse = await axios(config);
        const data = cruAssetsResponse?.data?.data
        const usdPrice =  filePrice.addn(Number(data?.priceUsd))
        return usdPrice.toNumber() / 1000000000000.0
    } catch (error) {
        console.log(error)
        return 0.000001
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