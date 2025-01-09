const { queryV1Beta1 } = require('./helper/chain/cosmos');
const { transformDexBalances } = require('./helper/portedTokens')

const chain = 'kava'

async function tvl() {
    const { pools } = await queryV1Beta1({ chain, url: 'swap/v1beta1/pools' });

    const data = pools.map(({ coins }) => ({
        token0: coins[0].denom,
        token1: coins[1].denom,
        token0Bal: coins[0].amount,
        token1Bal: coins[1].amount
    }))
    return transformDexBalances({ chain, data })
}

module.exports = {
    timetravel: false,
    kava: { tvl }
}