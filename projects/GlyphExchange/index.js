
const { request, } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')
const { staking } = require("../helper/staking.js");
const ADDRESSES = require('../helper/coreAssets.json')

const graphUrl = 'https://thegraph.coredao.org/subgraphs/name/glyph/glyph-tvl'
const graphQuery = `
    query GlyphFactories($block: Int) {
        glyphFactories(
          block: { number: $block }
        ) {
          totalVolumeUSD
          totalLiquidityUSD
        }
      }
`;

async function tvl({ timestamp }, ethBlock, chainBlocks) {
    const { glyphFactories } = await request(
        graphUrl,
        graphQuery,
        {
            block: chainBlocks['core'],
        }
    );

    const usdTvl = Number(glyphFactories[0].totalLiquidityUSD)

    return toUSDTBalances(usdTvl)
}

module.exports = {
    core: {
        tvl,
        staking: staking(
            ["0x6bf16B2645b13db386ecE6038e1dEF76d95696fc"],
            [ADDRESSES.null, "0xb3A8F0f0da9ffC65318aA39E55079796093029AD"],
            "core"
        ),
    }
}