const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
    arbitrum: {
        staking: {
            token: "0x05905af7933f89280aB258919F0dFA056CeD8e43", // CLUTCH token
            contract: "0x52070c2f7527822ccaea77e46fb23754151e2793" // CLUTCH staking contract
        },
        tvlTokens: [
            {
                token: ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
                contract: "0xbBEa81aBd42e8804de0f7d167Cf8123206d55039" // USDC TVL contract
            }
        ]
    },
    apechain: {
        staking: null, // No platform token staking on APE chain
        tvlTokens: [
            {
                token: "0x0000000000000000000000000000000000000000", // Native APE token
                contract: "0x7F66d16A488Eae9e2B61BfB186fD94bBA3611416" // APE contract
            },
            {
                token: "0xa2235d059f80e176d931ef76b6c51953eb3fbef4", // ApeUSD stablecoin
                contract: "0x812D9ed73aC36626CA893D99847E9978905b33C6" // ApeUSD contract
            }
        ]
    }
};

async function stakingTvl(_, _1, _2, { api }) {
    const chain = api.chain
    const stakingConfig = config[chain].staking;
    if (!stakingConfig) return {}; // Return empty TVL if no staking on chain
    return sumTokens2({ api, tokens: [stakingConfig.token], owners: [stakingConfig.contract] });
}

async function tvl(_, _1, _2, { api }) {
    const chain = api.chain
    const tokensAndOwners = config[chain].tvlTokens.map(({ token, contract }) => [token, contract]);
    const tvlValue = await sumTokens2({ api, tokensAndOwners });
    
    return tvlValue;
}

module.exports = {
    methodology: "TVL on Arbitrum includes CLUTCH token staking and USDC in lending pools. On APE Chain, TVL includes native APE token and ApeUSD stablecoin in lending pools. Values are calculated separately for staking and lending pools.",
    arbitrum: { 
       staking: stakingTvl, tvl  // Combined TVL and staking
    },
    apechain: { 
        tvl  // Track APE and ApeUSD lending
    },
};
