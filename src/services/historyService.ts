import {CronJob} from 'cron';
import _ from 'lodash';
import {bytesToTeraBytes, convertBN, parseObj} from "../util";
import { logger } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';
import { storage as storageInfo } from '../db';

export interface StorageInfo {
    date: number,
    totalStorage: number,
    totalPeers: number,
}

export const SLOT_LENGTH = 300;

const l = logger('history-service');

export default class HistoryService {
    readonly api: ApiPromise;

    constructor(_api: ApiPromise) {
        this.api = _api;
    }

    timer() {
        new CronJob('50 50 23 * * *', async () => {
            l.log(`Timer cron job work at ${JSON.stringify(new Date().getTime())}`);
            const storage = await this.getTotalStorage();        
            await storageInfo.saveStorageInfo({
                totalStorage: bytesToTeraBytes(storage.totalStorage),
                totalPeers: storage.validReports.length,
                date: new Date().getTime(),
            }).catch(e => l.error(`save storage info error ${e.message}`));
        }, null, true);
    }

    async getTotalStorage() {
        const free = parseObj(await this.api.query.swork.free());
        const currentSlot = parseObj(await this.api.query.swork.currentReportSlot());
        const workReports = parseObj(await this.api.query.swork.workReports.entries());
        const reportedFilesSize = parseObj(await this.api.query.swork.reportedFilesSize());
        let validReports = [];
        if (_.isArray(workReports)) {
            const realReports = _.map(workReports, (e) => {
                return e[1];
            });
            validReports = _.filter(realReports, (e) => {
                return e.report_slot >= currentSlot - SLOT_LENGTH;
            });
        }
        const totalStorage = convertBN(reportedFilesSize).add(convertBN(free));
        return {
            validReports,
            totalStorage,
        };
    }
}
