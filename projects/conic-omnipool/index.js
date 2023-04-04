const sdk = require('@defillama/sdk')

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}
      const pools = await api.call({ abi: 'address[]:listPools', target: '0x013A3Da6591d3427F164862793ab4e388F9B587e' })
      const bals = await api.multiCall({  abi: 'uint256:totalUnderlying', calls: pools }) 
      const tokens = await api.multiCall({  abi: 'address:underlying', calls: pools }) 
      bals.forEach((v, i) => sdk.util.sumSingleBalance(balances,tokens[i],v, api.chain))
      return balances
    }
  }
}