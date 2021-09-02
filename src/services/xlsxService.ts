import { storage } from '../db';
import moment from "moment";
import xlsx from "node-xlsx";

export const exportStorageInfo = async () => {
    const storageList = await storage.storageList();
    const names = ["存储信息概览"]
    const listData = [];
    listData.push(["日期", "总存储量", ["总结点数"]]);
    for (const storage of storageList) {
        const row = [];
        row.push(moment(storage.date).format('YYYY-MM-DD'));
        row.push(storage.totalStorage);
        row.push(storage.totalPeers);
        listData.push(row);
    }
    const xlsxName = `${moment().format('YYYY-MM-DD HH:mm:ss')}_storage.csv`;
    const datas = [listData];
    return {
        name: xlsxName,
        file: writeXls(datas, names)
    };
}

const writeXls = (datas: any[], fileName: string[], options?: any) => {
    const sheets = [];
    for (const index in datas) {
        sheets.push({
            name: fileName[index],
            data: datas[index]
        })
    }
    return xlsx.build(sheets, options);
}