// Load env

// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config();

export const dbEndpoint = process.env.DB_ENDPOINT as string;
export const chainEndpoint = process.env.CHAIN_ENDPOINT as string;
export const START_FROM = Number(process.env.START_FROM);
export const Storage_Timer = process.env.Storage_Timer;
export const port = Number(process.env.PORT)
export const apiUser = process.env.API_USER as string;
export const apiPass = process.env.API_PASS as string;