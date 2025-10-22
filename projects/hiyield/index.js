const config = {
  canto: {
    hyVWEAX: '0x0E4289a95207CA653b60B0eB0b5848f29F4C3f72'
  },
  avax: {
    TREASURY_BILLS: '0x8475509d391e6ee5A8b7133221CE17019D307B3E',
    INVESTMENT_GRADE_BONDS: '0xce6050625fe3F79bBfC4d236aBAaBE51AB59e660'
  }
}

const poolInfoABI = "function poolInfo() external view returns(uint256, uint256, uint256, uint256, uint256)"

Object.keys(config).forEach(chain => {
  let pools = config[chain]
  pools = Object.values(pools)
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'canto') {
        const pool = pools[0]
        const supply = await api.call({  abi: "uint256:totalSupply", target: pool })
        const poolInfo= await api.call({  abi: poolInfoABI, target: pool })
        api.addCGToken('tether', supply * poolInfo[4] / 1e36)
      } else {
        const poolInfos = await api.multiCall({  abi: poolInfoABI, calls: pools})
        let sum = poolInfos.reduce((acc, pool) => acc + pool[0]/1e6, 0)
        api.addCGToken('tether', sum)
      }
      return api.getBalances()
      
    }
  }
})