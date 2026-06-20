const { staking, } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/http');

const graph_endpoint = sdk.graph.modifyEndpoint('3URCfxZm32CHDYikF3eu93YCVpDKQyofm42FUh7KkRY9')
const graphQuery = gql`
query get_tvl($block: Int) {
  snxholders(orderBy:collateral,orderDirection:desc,block: { number: $block },first:1000,skip:0, where: {initialDebtOwnership_gt: 0, debtEntryAtIndex_gt: 0}) {
    collateral
  }
}`

async function tvl(ts, _block, chainBlocks) {
    const block = await getBlock(ts, 'bsc', chainBlocks)
    const { snxholders } = await request(
        graph_endpoint,
        graphQuery,
        { block: block - 1000 }
    );

    var totalCollateral = 0;
    for (const { collateral } of snxholders) {
        totalCollateral += +collateral        // sum of every user's collateral
    }

    return { 'bsc:0xc0eff7749b125444953ef89682201fb8c6a917cd': totalCollateral * 10 ** 18 };
}
const __inl_collateral = {
    collateral: tvl
};
const { collateral } = __inl_collateral;

const tokenStaking = [
    {
        stakingToken: '0x0409633A72D846fc5BBe2f98D88564D35987904D',      // phbToken
        rewardToken: '0xc0eff7749b125444953ef89682201fb8c6a917cd',        // hzn
        stakingContract: '0xa1771DCfb7822C8853D7E64B86E58f7f1eB5e33E'      // stakingContract
    },
    {
        stakingToken: '0xc0eff7749b125444953ef89682201fb8c6a917cd',      // hzn
        rewardToken: '0xc0eff7749b125444953ef89682201fb8c6a917cd',        // hzn
        stakingContract: '0x67D5a94F444DF4bBA254645065a4137fc665Bf98'      // stakingContract
    },
]
const lpStaking = [
    {
        stakingLPToken: '0xdc9a574b9b341d4a98ce29005b614e1e27430e74',     // hzn-bnb
        rewardToken: '0xc0eff7749b125444953ef89682201fb8c6a917cd',        // hzn
        stakingContract: '0x84838d0AB37857fAd5979Fcf6BDDf8ddb1cC1dA8'     // stakingContract
    },
    {
        stakingLPToken: '0xc3bf4e0ea6b76c8edd838e14be2116c862c88bdf',     // zusd-busd
        rewardToken: '0xc0eff7749b125444953ef89682201fb8c6a917cd',        // hzn
        stakingContract: '0x5646aA2F9408C7c2eE1dC7db813C8B687A959a85'     // stakingContract
    }
]

module.exports = {
            methodology: 'Counts liquidty on the token staking and lp staking contracts',
    bsc: {
        tvl: collateral,
        staking: staking(tokenStaking.map(i => i.stakingContract), tokenStaking.map(i => i.stakingToken)),
        pool2: staking(lpStaking.map(i => i.stakingContract), lpStaking.map(i => i.stakingLPToken))
    },
};