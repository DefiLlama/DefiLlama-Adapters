const { addUniV3LikePosition  } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const wildCreditABI = require('../wildcredit/abi.json');
const config = require('./config.json');

async function getTxLogs(chain, protocol, api, target, topics, fromBlock, eventAbi, isTokenId) {
    const logs = await getLogs({
        api,
        target,
        topics,
        fromBlock,
        eventAbi,
        onlyArgs: true,
        skipCache: true,
        skipCacheRead: true

    })
    return logs.filter((l) => ( l && (chain === 'ethereum' || l.nfpm === config[chain][protocol].nfpm))).map((log) => (isTokenId ? log.tokenId : log.newTokenId));
}

function getAllTxLogs(chain, protocol, api, contracts, events, fromBlock, promises) {
    for (const ct of contracts) {
        for (const e of events) {
            let promise = getTxLogs(chain, protocol, api, ct, e.topics, fromBlock, e.eventAbi, !e.newTokenId);
            promises.push(promise);
        }
    }
    return promises;
}

Object.keys(config).forEach(chain => {
    Object.keys(config[chain]).forEach(protocol => {
        module.exports[chain] = {
            tvl: async (api) => {
                var positionIds = [];
                let promises = [];
                config[chain][protocol].contracts.forEach(ct => {
                    getAllTxLogs(chain, protocol, api, ct.addresses, ct.events, config[chain][protocol].fromBlock, promises);
                });
                
                const ids = (await Promise.all(promises).then(result => result.flat()));
                positionIds = [...positionIds, ...ids];
                
                const positions = (await sdk.api.abi.multiCall({
                    chain, abi: wildCreditABI.positions, target: config[chain][protocol].nfpm,
                    calls: positionIds.map((position) => ({ params: [position] })),
                  })).output.map(position => position.output);
                const getKey = (token0, token1, fee) => `${token0}-${token1}-${fee}`;
                
                const lpInfo = {};
                positions.forEach(position => lpInfo[getKey(position)] = position);
                const lpInfoArray = Object.values(lpInfo);
              
                const poolInfos = (await sdk.api.abi.multiCall({
                 chain, abi: wildCreditABI.getPool, target: config[chain][protocol].factory,
                  calls: lpInfoArray.map((info) => ({ params: [info.token0, info.token1, info.fee] })),
                })).output.map(positionsCall => positionsCall.output);
    
                const slot0 = await sdk.api.abi.multiCall({ chain, abi: wildCreditABI.slot0, calls: poolInfos.map(i => ({ target: i })) });
              
                slot0.output.forEach((slot, i) => lpInfoArray[i].tick = slot.output.tick);
    
                lpInfoArray.forEach(({ token0, token1, tickUpper, tickLower, liquidity, tick }) => {
                    if (liquidity === 0) return;
                    if (!tick) return;  // pool not found
                    addUniV3LikePosition({ api, token0, token1, tick: Number(tick), liquidity, tickUpper: Number(tickUpper), tickLower: Number(tickLower), });
                });
            },  
        };
    })
});