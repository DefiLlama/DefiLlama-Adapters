const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: [
    // https://docs.reservoir.xyz/products/proof-of-reserves
    '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
    '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
    '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
    // '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61', - exluded RUSD because it is project's own token
  ]
}

Object.keys(config).forEach(chain => {
  const funds = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: funds })
      const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: funds })
      const decimals  = await api.multiCall({  abi: 'uint8:decimals', calls: tokens })
      bals.forEach((v, i) => bals[i] = v * 10 ** (decimals[i] - 18))
      api.add(tokens, bals)
      return api.sumTokens({
        owner: '0x4809010926aec940b550D34a46A52739f996D75D', token: ADDRESSES.ethereum.USDC
      })
    }
  }
})