const sdk = require("@defillama/sdk");

const plasma = "plasma";
const monad = "monad";
const mainnet = "ethereum";

const yzUsd = '0x6695c0f8706C5ACe3Bdf8995073179cCA47926dc';
const yzUsdOftMonad = '0x9dcB0D17eDDE04D27F387c89fECb78654C373858';
const yzUsdOftMainnet = '0x387167e5C088468906Bcd67C06746409a8E44abA';

const syzUsd = '0xC8A8DF9B210243c55D31c73090F06787aD0A1Bf6';
const syzUsdOftMonad = '0x484be0540aD49f351eaa04eeB35dF0f937D4E73f';
const syzUsdOftMainnet = '0x6DFF69eb720986E98Bb3E8b26cb9E02Ec1a35D12';

const yzPp = '0xEbFC8C2Fe73C431Ef2A371AeA9132110aaB50DCa';
const yzPpOftMonad = '0xb37476cB1F6111cC682b107B747b8652f90B0984';
const yzPpOftMainnet = '0xB2429bA2cfa6387C9A336Da127d34480C069F851';

const yzUsdId = 'plasma:' + yzUsd;
const syzUsdId = 'plasma:' + syzUsd;
const yzPpId = 'plasma:' + yzPp;

async function totalSupply(token, chain) {
    const resp = await sdk.api.abi.call({ abi: 'erc20:totalSupply', target: token, chain: chain });
    return BigInt(resp.output);
}

async function totalAssets(vault, chain) {
    const resp = await sdk.api.abi.call({ abi: 'uint256:totalAssets', target: vault, chain: chain });
    return BigInt(resp.output);
}

function tvl() {
    return {
        methodology: `Aggregate of idle yzUSD, syzUSD, and yzPP across chains`,
        misrepresentedTokens: true,
        plasma: {
            tvl: async (api) => {
                const yzUsdTotalSupply = await totalSupply(yzUsd, plasma);
                const yzPpTotalSupply = await totalSupply(yzPp, plasma);
                const syzUsdTotalSupply = await totalSupply(syzUsd, plasma);
                const syzUsdTotalAssets = await totalAssets(syzUsd, plasma);

                const yzUsdTotalSupplyMonad = await totalSupply(yzUsdOftMonad, monad);
                const syzUsdTotalSupplyMonad = await totalSupply(syzUsdOftMonad, monad);
                const yzPpTotalSupplyMonad = await totalSupply(yzPpOftMonad, monad);

                const yzUsdTotalSupplyMainnet = await totalSupply(yzUsdOftMainnet, mainnet);
                const syzUsdTotalSupplyMainnet = await totalSupply(syzUsdOftMainnet, mainnet);
                const yzPpTotalSupplyMainnet = await totalSupply(yzPpOftMainnet, mainnet);

                const yzUsdAdjSupplyPlasma = yzUsdTotalSupply - syzUsdTotalAssets - yzUsdTotalSupplyMonad - yzUsdTotalSupplyMainnet;
                const syzUsdAdjSupplyPlasma = syzUsdTotalSupply - syzUsdTotalSupplyMonad - syzUsdTotalSupplyMainnet;
                const yzPpAdjSupplyPlasma = yzPpTotalSupply - yzPpTotalSupplyMonad - yzPpTotalSupplyMainnet;

                api.addTokenVannila(yzUsdId, yzUsdAdjSupplyPlasma);
                api.addTokenVannila(syzUsdId, syzUsdAdjSupplyPlasma);
                api.addTokenVannila(yzPpId, yzPpAdjSupplyPlasma);
            },
        },
        monad: {
            tvl: async (api) => {
                const yzUsdTotalSupplyMonad = await totalSupply(yzUsdOftMonad, monad);
                const syzUsdTotalSupplyMonad = await totalSupply(syzUsdOftMonad, monad);
                const yzPpTotalSupplyMonad = await totalSupply(yzPpOftMonad, monad);

                api.addTokenVannila(yzUsdId, yzUsdTotalSupplyMonad);
                api.addTokenVannila(syzUsdId, syzUsdTotalSupplyMonad);
                api.addTokenVannila(yzPpId, yzPpTotalSupplyMonad);
            },
        },
        ethereum: {
            tvl: async (api) => {
                const yzUsdTotalSupplyMainnet = await totalSupply(yzUsdOftMainnet, mainnet);
                const syzUsdTotalSupplyMainnet = await totalSupply(syzUsdOftMainnet, mainnet);
                const yzPpTotalSupplyMainnet = await totalSupply(yzPpOftMainnet, mainnet);

                api.addTokenVannila(yzUsdId, yzUsdTotalSupplyMainnet);
                api.addTokenVannila(syzUsdId, syzUsdTotalSupplyMainnet);
                api.addTokenVannila(yzPpId, yzPpTotalSupplyMainnet);
            },
        },
    };
}

module.exports = {
    ...tvl(),
};
