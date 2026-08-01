const config = {
  hsk: [
    "0x80C080acd48ED66a35Ae8A24BC1198672215A9bD", // AoABT
    "0x34B842D0AcF830134D44075DCbcE43Ba04286c12", // AoABTb
    "0xf00A183Ae9DAA5ed969818E09fdd76a8e0B627E6", // AoABTa12m
  ],
  avax: [
    "0xB2EA3E7b80317c4E20D1927034162176e25834E2", // AoABTd
  ]
}

Object.keys(config).forEach(chain => {
  const tokens = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const supply  = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
      api.add(tokens, supply)
    }
  }
})