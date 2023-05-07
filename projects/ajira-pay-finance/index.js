const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2")

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const KAVA_STAKING_CONTRACT = "0xD1cAf204721A02016993796663EDb00E6Ad9dac4"
const BSC_STAKING_CONTRACT = '0xEbD5a0bAED48747ea10feEB61a09a93550Fddcef'

const ammLpData = {
    arbitrum: {
        poolAddress: '0x0C36cB133CFF5D36313eFF3FF1761F9d391DF8Fc',
        ammLpTokens: [
            "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            AJP_CONTRACT_ADDRESS
        ]
    },
    bsc: {
        poolAddress: '0x808A234665c7684A5e0Ed5e6BB551dBA1cc9d3e4',
        ammLpTokens: [
            AJP_CONTRACT_ADDRESS,
            "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        ]
    },
    polygon: {
        poolAddress: '0x2aDA82d11f6bC2bd357E7F3A6674983C372a50A3',
        ammLpTokens: [
            "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            AJP_CONTRACT_ADDRESS
        ]
    }
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance TVL Calculations are based on AJP Staking pool and Liquidity pool balances respectively on the AMMs",
    kava: {
        staking: staking(KAVA_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "kava"),
        tvl: () => ({})
    },
    bsc: {
        staking: staking(BSC_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "bsc"),
        pool2: pool2Exports(ammLpData.bsc.poolAddress, ammLpData.bsc.ammLpTokens, 'bsc'),
        tvl:  () => ({})
    },
    polygon: {
        tvl: () => ({}),
        pool2: pool2Exports(ammLpData.polygon.poolAddress, ammLpData.polygon.ammLpTokens, 'polygon'),
    },
    arbitrum: {
        tvl: () => ({}),
        pool2: pool2Exports(ammLpData.arbitrum.poolAddress, ammLpData.arbitrum.ammLpTokens, 'arbitrum'),
    }
};
