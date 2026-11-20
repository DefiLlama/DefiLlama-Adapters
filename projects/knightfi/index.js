const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

// KnightFi Fortress contribution pools (https://knightfi.io)
// Each pool holds a single stablecoin. TVL is the stablecoin balance held by the pool contracts:
// contributions waiting for the next cycle, reported distributions not yet claimed, and
// fee/referral balances not yet withdrawn. At each cycle start, waiting contributions are sent
// from the pool to the pool's treasury wallet and traded off-chain by the operator; those funds
// are NOT counted, because they are no longer held by protocol contracts.

const BXUSD = ADDRESSES.bxn.BXUSD

const config = {
  bxn: {
    token: BXUSD,
    pools: [
      '0xf27B82349A287484D2e12BaC23FBA34cd42Bc952', // Fortress 200 (ContributionPoolV2)
      '0x7aEd037Eb15DB2371c3F43b2ee884c9EB1504828', // Fortress 200 (v1, deposits paused, holds unclaimed distributions)
    ],
  },
  ethereum: {
    token: ADDRESSES.ethereum.USDC,
    pools: [
      '0x02Fd365d7803AAc00C4A58f9b6AdBEc766F9A889', // USDC Fortress (ContributionPoolV2)
    ],
  },
}

module.exports = {
  methodology: 'TVL is the stablecoin balance (bxUSD on BlackFort, USDC on Ethereum) held by the KnightFi Fortress pool contracts: contributions waiting for the next cycle, reported distributions that users have not claimed yet, and fee and referral balances not yet withdrawn. When a cycle starts, waiting contributions move to the pool treasury wallet and are traded off-chain; those funds are not counted.',
}

Object.keys(config).forEach(chain => {
  const { token, pools } = config[chain]
  module.exports[chain] = { tvl: sumTokensExport({ owners: pools, tokens: [token] }) }
})
