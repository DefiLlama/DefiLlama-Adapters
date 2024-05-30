const { sumToken2, addUniV3LikePosition  } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const wildCreditABI = require('../wildcredit/abi.json');

const config = {
    arbitrum: {
        automationContract: ["0x47dc0150d74D30118532A436846bd36c3390abC3", "0xda7D6F76E0b122aAd62c12016880e6BA4174A2F2", "0x0165fccb10acec3377808b02f4878fe0e8806831"],
        nfpm: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        topics: ["0xe878b7324da2e10eb701c2cf0474248cdf5c088bb68aaf3045a6c15d1008b12d"],
        eventAbi: "event ChangeRange(address indexed nfpm, uint256 indexed tokenId, uint256 newTokenId, uint256 newLiquidity, uint256 token0Added, uint256 token1Added)",
    }
};

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            for (const contract of config[chain].automationContract) {
                const logs = await getLogs({
                    api,
                    target: contract,
                    topics: config[chain].topics,
                    fromBlock: 1000,
                    eventAbi: config[chain].eventAbi,
                    onlyArgs: true,
                   
    
                });
                    
                const positions = (await sdk.api.abi.multiCall({
                    chain, abi: wildCreditABI.positions, target: config[chain].nfpm,
                    calls: logs.map((position) => ({ params: [position.newTokenId] })),
                  })).output.map(position => position.output);
    
                const getKey = (token0, token1, fee) => `${token0}-${token1}-${fee}`;
                  
                const lpInfo = {}
                positions.forEach(position => lpInfo[getKey(position)] = position)
                const lpInfoArray = Object.values(lpInfo)
              
                const poolInfos = (await sdk.api.abi.multiCall({
                 chain, abi: wildCreditABI.getPool, target: config[chain].factory,
                  calls: lpInfoArray.map((info) => ({ params: [info.token0, info.token1, info.fee] })),
                })).output.map(positionsCall => positionsCall.output);
              
                const slot0 = await sdk.api.abi.multiCall({ chain, abi: wildCreditABI.slot0, calls: poolInfos.map(i => ({ target: i })) });
              
                slot0.output.forEach((slot, i) => lpInfoArray[i].tick = slot.output.tick);
            
                lpInfoArray.forEach(({ token0, token1, tickUpper, tickLower, fee, liquidity, tick }) => {
                    if (liquidity === 0) return;
                    if (!tick) return;  // pool not found
                    addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, })
                })
            }
        },  
        
    };
});


