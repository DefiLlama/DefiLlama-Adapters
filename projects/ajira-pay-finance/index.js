const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens.js");

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const STAKING_CONTRACT = "0x894E327f11b09ab87Af86876dCfCEF40eA086f34"

const factory = {
    bsc:'',
    polygon:'',
    arbitrum:'',
    kava:''
}

const chains = [
    'polygon', 
    'kava',
    'arbitrum',
    'bsc'
]

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance TVL Calculations are based on AJP KAVA Staking pool and liquidity on the AMM pairs from the factory addresses",
    kava: {
        staking: staking(STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "kava"),
        tvl: getUniTVL({
            factory: factory.kava,
            chain: chains[1],
            useDefaultCoreAssets: true,
        }),
    },
    bsc: {
        tvl: getUniTVL({
            factory: factory.bsc,
            chain: chains[3],
            useDefaultCoreAssets: true,
        }),
    },
    polygon: {
        tvl: getUniTVL({
            factory: factory.polygon,
            chain: chains[0],
            useDefaultCoreAssets: true,
        }),
    },
    arbitrum: {
        tvl: getUniTVL({
            factory: factory.arbitrum,
            chain: chains[2],
            useDefaultCoreAssets: true,
        }),
    }
};