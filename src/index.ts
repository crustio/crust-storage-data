import { logger } from '@polkadot/util';
import pRetry from 'p-retry';
import { nodeWatcher } from './nodeWatcher';
import express from 'express';
import {argv} from 'process';
import cors from 'cors';
// eslint-disable-next-line node/no-extraneous-import
import bodyParser from 'body-parser';
import { storage } from './db';
import { _api } from './nodeWatcher';
import { bytesToTeraBytes, convertBN, parseObj } from './util';
import _ from 'lodash';
import { port, apiUser, apiPass } from './env';
import { exportStorageInfo } from './services/xlsxService';
import mcache  from "memory-cache";

const basicAuth = require('express-basic-auth');

const l = logger('main');

const app = express();

const cache = (duration: number) => {
  return (req: any, res: any, next: any) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body: any) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

app.use(cors());
app.use(bodyParser.json());
app.use(cache(60*30))

// TODO: add error handling
const main = async () => {

  await pRetry(nodeWatcher, {
    onFailedAttempt: error => {
      console.log(
        `${error.message} - Retry attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
      );
    },
    retries: 10,
  }) 
};

main().catch(e => {
  l.error(e);
  process.exit(1);
});

app.get('/api/storage', basicAuth({
  users: { [apiUser]: apiPass }
}), async (_, res) => {
  res.send({
    status: 'success',
    data: await storage.storageList()
  })
});

app.get('/api/totalStorage', basicAuth({
  users: { [apiUser]: apiPass }
}), async (_, res) => {
  const api = await _api.isReadyOrError;
  const free = parseObj(await api.query.swork.free());
  const reportedFilesSize = parseObj(await api.query.swork.reportedFilesSize());
  const totalStorage = convertBN(reportedFilesSize).add(convertBN(free));
  res.send({
    status: 'success',
    data: bytesToTeraBytes(totalStorage)
  })
});

app.get('/api/exportStorageInfo', async (_, res) => {
  const result = await exportStorageInfo();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader("Content-Disposition", "attachment; filename=" + result.name);
  res.end(result.file, 'binary');
});

process.on('uncaughtException', (err: Error) => {
  l.log(`uncaughtException, ${err.message}`)
});

app.listen(port, () => { l.log('App listening on port ' + port) });
