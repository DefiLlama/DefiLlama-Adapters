const sdk = require("@defillama/sdk");
const { staking, } = require("../helper/staking");
const { sumTokens } = require('../helper/unwrapLPs');
const { collateral } = require('./collateral.js');

const hzn_bnb_LP = '0xdc9a574b9b341d4a98ce29005b614e1e27430e74'

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

async function calculateLPStaking(timestamp, _block, chainBlocks) {
    const block = chainBlocks.bsc
    const tokensAndOwners = lpStaking.map(lp => [lp.stakingLPToken, lp.stakingContract])
    const balances = {}
    await sumTokens(balances, tokensAndOwners, block, 'bsc', undefined, { resolveLP: true })
    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Counts liquidty on the token staking and lp staking contracts',
    bsc: {
        tvl: collateral,
        staking: sdk.util.sumChainTvls([
            staking(tokenStaking[0].stakingContract, tokenStaking[0].stakingToken, "bsc"), 
            staking(tokenStaking[1].stakingContract, tokenStaking[1].stakingToken, "bsc"), 
        ]),
        pool2: calculateLPStaking
    },
};