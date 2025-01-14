const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(api) {
    const MEMETA_CONTRACT_ADDRESS = "0xD76A1A03C4873042c50ba77cE455C793C70d1b2d";

    return api.sumTokens({
        owner: MEMETA_CONTRACT_ADDRESS,
        tokens: [
            ADDRESSES.manta.WETH,
            ADDRESSES.manta.USDC,
            ADDRESSES.manta.USDT,
            ADDRESSES.manta.WBTC,
        ],
    });
}

module.exports = {
    manta: { tvl },
};