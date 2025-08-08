const ADDRESSES = require('../helper/coreAssets.json')

/**
 * Turtle TVL adapter
 *
 * – Counts native CRO on Treasury, NFT, Earning contracts
 * – Counts WCRO, WBTC, USDC liquidities on DEX pairs
 */

async function tvl(api) {
  const toa = [
    [ADDRESSES.cronos.WCRO_1, '0x2fdd58b14b6c6a02623fe01aded951f5bd6cbc0e'], // Turtle/WCRO on Ebisus Bay
    [ADDRESSES.cronos.WCRO_1, '0xf5d8f38541abdd4e5e9a50af11ebae9b7780f6fb'], // Turtle/WCRO on MM Finance
    [ADDRESSES.cronos.USDC, '0xc8fcfc922338d94d601758acf05e0372155c39f1'], // Turtle/USDC on VVS Finance
    [ADDRESSES.cronos.WCRO_1, '0xea8f22344dd9269b030381f676432270a22a5837'], // Turtle/WCRO on VVS Finance
    [ADDRESSES.cronos.WBTC, '0x39605f9141f4fd2c66bc0bbf2ea350dab205fa2f'], // Turtle/WBTC on VVS Finance
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
    'Sums native CRO on Treasury, NFT, Earning contracts and all WCRO, WBTC, USDC liquidities.'
}
