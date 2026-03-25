const PGOLD = '0x3e76bb02286bfeaa89dd35f11253f2cbce634f91'

module.exports = {
methodology: "TVL corresponds to the total amount of PGOLD minted",
arbitrum: {
tvl: async (api) => {
const totalSupply = await api.call({target: PGOLD, abi: 'erc20:totalSupply'})
api.add(PGOLD, totalSupply)
},
}
}
