const { ApiPromise, WsProvider } = require("@polkadot/api");
const sdk = require('@defillama/sdk');

const api = {};

const providers = {
  kintsugi: [
    "wss://api-kusama.interlay.io/parachain",
    "wss://kintsugi-rpc.dwellir.com",
  ],
  interlay: [
    "wss://api.interlay.io/parachain",
    "wss://interlay-rpc.dwellir.com",
  ],
};

async function getAPI(chain) {
    if (!api[chain]) {
        const provider = new WsProvider(providers[chain]);
        const apiOptions = {
        provider,
        noInitWarn: true,
        };
        api[chain] = ApiPromise.create(apiOptions);
    }

    await api[chain].isReady;
    return api[chain];
}

// common tokens/assets used in dex and lending
const ccyMapping = {
    kintsugi: {
        token: {
            KSM: { geckoId: "kusama", decimals: 12 },
            KINT: { geckoId: "kintsugi", decimals: 12 },
            KBTC: { geckoId: "kintsugi-btc", decimals: 8 },
        },
        foreignAsset: {
            3: { ticker: "USDT", geckoId: "tether", decimals: 6 },
            5: { ticker: "VKSM", geckoId: "voucher-ksm", decimals: 12 },
        },
    },
    interlay: {
        token: {
            DOT: { geckoId: "polkadot", decimals: 10 },
            INTR: { geckoId: "interlay", decimals: 10 },
            IBTC: { geckoId: "interbtc", decimals: 8 },
        },
        foreignAsset: {
            2: { ticker: "USDT", geckoId: "tether", decimals: 6 },
            3: { ticker: "VDOT", geckoId: "voucher-dot", decimals: 10 },
            11: { ticker: "BNC", geckoId: "voucher-bnc", decimals: 12 },
            12: { ticker: "USDC", geckoId: "usd-coin", decimals: 6 },
            13: { ticker: "HDX", geckoId: "hydradx", decimals: 12 },
        },
    },
};
  
function addTokenBalance({ balances, atomicAmount, chain, ccyArg }) {
    const ccyJson = ccyArg.toJSON();

    let ccy;
    if (ccyJson.token) {
        ccy = ccyMapping[chain].token[ccyJson.token];
    }

    if (ccyJson.foreignAsset) {
        ccy = ccyMapping[chain].foreignAsset[ccyJson.foreignAsset];
    }

    if (ccy === undefined) {
        sdk.log("Skip token/asset, missing details for: ", ccyArg.toString());
        return;
    }

    const amount = atomicAmount / (10 ** ccy.decimals)

    return sdk.util.sumSingleBalance(balances, ccy.geckoId, amount);
}

module.exports = {
    getAPI,
    addTokenBalance,
};