const sdk = require('@defillama/sdk')
const {getTokens} = require('../helper/getTokens')

const pool = '0xA4fc358455Febe425536fd1878bE67FfDBDEC59a'

async function tvl(timestamp, block) {
    const tokens = await getTokens(pool);
    const balances = {}
    const tokenBalances = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: tokens.map(token=>({
            target:token,
            params: [pool]
        })),
        block
    })
    sdk.util.sumMultiBalanceOf(balances, tokenBalances)
    return balances
}

module.exports = {
    tvl
}