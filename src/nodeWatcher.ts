import { chainEndpoint, START_FROM, Storage_Timer } from './env';
import { logger } from '@polkadot/util';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import HistoryService from './services/historyService';
import { block } from './db';

const l = logger('node-watcher');

function waitFinalized(
    api: ApiPromise,
    lastKnownBestFinalized: number
): Promise<{ unsub: () => void; bestFinalizedBlock: number }> {
    return new Promise(resolve => {
        async function wait(): Promise<void> {
            const unsub = await api.derive.chain.bestNumberFinalized(best => {
                if (best.toNumber() > lastKnownBestFinalized) {
                    resolve({ unsub, bestFinalizedBlock: best.toNumber() });
                }
            });
        }

        wait();
    });
}

let blockIndex = START_FROM;

export let _api: ApiPromise;

export async function nodeWatcher(): Promise<unknown> {
    return new Promise((_, reject) => {
        let keepLooping = true;
        const provider = new WsProvider(chainEndpoint);
        ApiPromise.create({
            provider,
            typesBundle: typesBundleForPolkadot,
        }).then(async (api) => {
            _api = api;

            api.once('error', e => {
                keepLooping = false;
                api.disconnect();
                reject(new Error(`Api error: ${e}`));
            });

            api.once('disconnected', e => {
                keepLooping = false;
                api.disconnect(); 
                reject(new Error(`Api disconnected: ${e}`));
            });

            const historyService = new HistoryService(api);
            const blockInDb = await block.latestBlockFromDb();

            if (Storage_Timer == 'true') {
                historyService.timer();
            }

            if (blockInDb) {        
                blockIndex = blockInDb.blockNumber;
            }
            let lastKnownBestFinalized = (
                await api.derive.chain.bestNumberFinalized()
            ).toNumber();

            while (keepLooping) {
                // MAX_LAG isn't set, only the finalization matters
                if (blockIndex > lastKnownBestFinalized) {
                    l.warn('Waiting for finalization.');
                    const { unsub, bestFinalizedBlock } = await waitFinalized(
                        api,
                        lastKnownBestFinalized
                    );
                    unsub && unsub();
                    lastKnownBestFinalized = bestFinalizedBlock;
                    continue;
                }

                l.warn(`blockIndex: ${blockIndex}`);
                l.warn(`lastKnownBestFinalized: ${lastKnownBestFinalized}`);
                
                blockIndex += 1;
                await block.upsertBlockNumber(blockIndex);
            }
        }).catch(async (e) => {
            keepLooping = false;
            reject(new Error(`Connection error: ${e}`))
        })
    })
}