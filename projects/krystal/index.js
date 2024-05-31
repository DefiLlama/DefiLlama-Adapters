const { addUniV3LikePosition  } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const wildCreditABI = require('../wildcredit/abi.json');

const config = {
    arbitrum: {
        univ3: {
            nfpm: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            fromBlock: 201539912,
            contracts: [
                {
                    addresses: ["0x47dc0150d74d30118532a436846bd36c3390abc3", "0xda7d6f76e0b122aad62c12016880e6ba4174a2f2", "0x0165fccb10acec3377808b02f4878fe0e8806831"],
                    events: [
                        {
                            topics: ["0xe878b7324da2e10eb701c2cf0474248cdf5c088bb68aaf3045a6c15d1008b12d"],
                            eventAbi: "event ChangeRange(address indexed nfpm, uint256 indexed tokenId, uint256 newTokenId, uint256 newLiquidity, uint256 token0Added, uint256 token1Added)",
                            newTokenId: true,
                        },
                    ],
                },
                {
                    addresses: ["0x1b026577241654671be10eacead97a75f671719b"],
                    events: [
                        {
                            topics: ["0xa9c03b58d729c750f50b2c6854d5db412e7faa78156e5ddf9225285e19011ff7"],
                            eventAbi: "event SwapAndMint(address indexed nfpm, uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
                        }, 
                        {
                            topics: ["0xe96b62a2783f0eb40eb1daf87ed80a62c56c56e33c3669bf7f1ce575bd5d81ac"],
                            eventAbi: "event SwapAndIncreaseLiquidity(address indexed nfpm, uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
                        },
                        {
                            topics: ["0x2ec1ca6e1389adeac5f1eb191a259a49f42071650bdd782177f7e6d988f2a3f2"],
                            eventAbi: "event ChangeRange(address indexed nfpm, uint256 indexed tokenId, uint256 newTokenId)",
                            newTokenId: true
                        },
                    ]
                }
            ],
        },
    },
};

async function getTxLogs(chain, protocol, api, target, topics, fromBlock, eventAbi, isTokenId) {
    const logs = await getLogs({
        api,
        target,
        topics,
        fromBlock,
        eventAbi,
        onlyArgs: true,
    })
    return logs.filter((l) => (l.nfpm === config[chain][protocol].nfpm)).map((log) => (isTokenId ? log.tokenId : log.newTokenId));
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
                    addUniV3LikePosition({ api, token0, token1, tick: Number(tick), liquidity, tickUpper: Number(tickUpper), tickLower: Number(tickLower), })
                });
            },  
        };
    })
});


