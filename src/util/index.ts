import BN from 'bn.js';

const CAPACITY_SIZES = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
export const CAPACITY_BASE_UNIT = 1024;

const CAPACITY_UNIT = 1024*1024*1024;
const MILLION_CAPACITY_UNIT = new BN(CAPACITY_UNIT.toString());
const CRU_UNIT = new BN('1000000000');

export const parseObj = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Convert from hex to string
 * @param hex Hex string with prefix `0x`
 * @return With string back
 */
export const hexToString = (hex: string): string => {
  return Buffer.from(hex.substring(2), 'hex').toString();
};

export const formatCapacity = (value: BN) => {
  const byteValue = value.divn(1024).toNumber();
  if (byteValue === 0) return '0 B';
  const i = Math.floor(Math.log(byteValue) / Math.log(CAPACITY_BASE_UNIT));
  const unitPost = CAPACITY_SIZES[i];
  const postfix = (byteValue / Math.pow(CAPACITY_BASE_UNIT, i)).toFixed(3);
  
  return postfix + unitPost;
};

/**
 * Convert the number of bytes to TB
 * @param byteSize
 */
export const bytesToTeraBytes = (byteSize: BN) => {
  if (byteSize.isZero()) return 0;
  byteSize = byteSize.div(MILLION_CAPACITY_UNIT);
  return Number(byteSize.toString()) / 1024.0;
};

export const unitToNumber = (unit: BN) => {
  if (unit.isZero()) return 0;
  return unit.div(CRU_UNIT).toNumber() / 1000.0;
}

export const convertBN = (numberData: any) => {
  return new BN(Number(numberData).toString());
}