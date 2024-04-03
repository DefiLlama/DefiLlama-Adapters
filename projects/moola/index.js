const ADDRESSES = require('../helper/coreAssets.json')
const { aaveChainTvl } = require('../helper/aave')
const { singleAssetV1Market } = require('../aave/v1')
const sdk = require('@defillama/sdk')

const v1PoolCore = "0xAF106F8D4756490E7069027315F4886cc94A8F73"
const gasAsset = ADDRESSES.celo.CELO

function lending(borrowed) {
    return async (timestamp, ethBlock, {celo: block}) => {
        const chain = 'celo'
        const v1Balances = {};
        await singleAssetV1Market(v1Balances, v1PoolCore, block, borrowed, chain, gasAsset);

        const balances = await aaveChainTvl(chain, "0xF03982910d17d11670Dc3734DD73292cC4Ab7491", addr => `celo:${addr}`, ["0x43d067ed784D9DD2ffEda73775e2CC4c560103A1"], borrowed)(timestamp, ethBlock, {
            celo: block
        })
        Object.entries(v1Balances).map(entry => sdk.util.sumSingleBalance(balances, "celo:" + entry[0], entry[1]))
        return balances
    }
}

// v2 addresses on https://github.com/moolamarket/moola-v2/commit/ab273248af81aa743310b4fd48533462aefe39e9
module.exports = {
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    celo: {
        tvl: lending(false),
        borrowed: lending(true),
    }
}