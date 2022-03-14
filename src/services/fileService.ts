import { _api } from '../nodeWatcher';
import BN from 'bn.js';
const axios = require('axios');

const config = {
  method: 'get',
  url: 'https://api.coincap.io/v2/assets/crust',
  headers: { }
};

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
        return 0
    }

}