const { getLogs2 } = require('../helper/cache/getLogs')

const factory = '0xd5E5Fef4cFeFb67bbA0aA1dc74B2Cd196B4786AC'
const fromBlock = 35090407
const eventAbi = 'event PairCreated(address indexed tokenA, address indexed tokenB, address indexed pair, uint256 index)';

async function tvl(api) {
    const logs = await getLogs2({ api, factory, eventAbi, fromBlock });
    const tokensAndOwners = logs.map(l => [l.tokenB, l.pair])

    await api.sumTokens({ tokensAndOwners })
}

module.exports = {
    methodology: 'Counts the total value of LT tokens in alt.fun bonding curves.',
    hyperliquid: { tvl }
}