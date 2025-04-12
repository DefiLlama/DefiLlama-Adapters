const config = {
  bsc: "0x1987d8109638A028BB8bE654531B15642a8708E3",
  fhe:"0xe8451dC0959469e42F2679b3eC085e58FB212b11"
};

// const token = "0xd55C9fB62E176a8Eb6968f32958FeFDD0962727E"

module.exports = {
  methodology: "Counts the total amount of FHE tokens deposited in Mind Agentic World contracts on BSC and MindChain.",
}

Object.keys(config).forEach(chain => {
  const target = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tvlAmount = await api.call({
        abi: "function allHubAssetAmount() view returns (uint256)", 
        target,
      })
       const bigIntAmount = BigInt(tvlAmount); 
       const amountInToken = bigIntAmount / BigInt(10 ** 18); 
      // api.add(token, tvlAmount,{ priceChain: "bsc" })
      api.addCGToken("mind-network", amountInToken)
    }
  }
})
      
