const config = {
  bsc: "0xb080B94052f039eC2CA8BBaF7Ec13329d1926973",
  fhe:"0xdeD96288c99145da4800f55355A2466f6238fBBE"
};

const token = "0xd55C9fB62E176a8Eb6968f32958FeFDD0962727E"

module.exports = {
  methodology: "Counts the total amount of FHE tokens deposited in Mind Agentic World contracts on BSC and MindChain.",
}

Object.keys(config).forEach(chain => {
  const target = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tvlAmount =  await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [target],
      }); 
       const bigIntAmount = BigInt(tvlAmount); 
       const amountInToken = bigIntAmount / BigInt(10 ** 18); 
      // api.add(token, tvlAmount,{ priceChain: "bsc" })
      api.addCGToken("mind-network", amountInToken)
    }
  }
})
      
