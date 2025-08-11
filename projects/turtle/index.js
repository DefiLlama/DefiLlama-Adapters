const ADDRESSES = require('./helper/coreAssets.json')

/**
 * Turtle TVL adapter
 *
 * – Counts native CRO on Treasury, NFT, Earning contracts
 */

async function tvl(api) {
  const toa = [
    [ADDRESSES.null, '0x88524dca00112b9915f73a1d25cb4140897a9f53'], // Treasury
    [ADDRESSES.null, '0x2baa455e573df4019b11859231dd9e425d885293'], // NFT
    [ADDRESSES.null, '0x7016db90c1f8b87ea4d18b7e53fb7c42999bc995'] // Earning
  ]

  return api.sumTokens({ tokensAndOwners: toa })
}

module.exports = {
  cronos: {
    tvl,
  },
  methodology:
    'Sums native CRO on Treasury, NFT, Earning contracts.'
}
