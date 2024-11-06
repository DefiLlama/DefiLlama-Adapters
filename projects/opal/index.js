const config = {
  ethereum: [
    "0x86b130298719F753808E96cA6540b684a2d21466",// wstETH
    "0xD2358c5d01065b13F2Ad1107d5a4531Cd98aC7A1",// rETH
    "0x0c8e1e97d9f41a21D6Ef98E644a5516d9b7F593f",// wETH
    "0x2165AEA91B33631A772d1723b88a98C1Ca820116",// weETH
    "0x4aCc76B4B3E4529D7cE88Ca921D7a4112f25A6dA", // USDC
  ]
}

Object.keys(config).forEach(chain => {
  const pools = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const uPools = await api.fetchList({  lengthAbi: 'getUnderlyingPoolsLength', itemAbi: 'function getUnderlyingPool(uint8) view returns (address)', targets: pools, groupedByInput: true, })
      const ownerTokens = uPools.map((tokens, i) => [tokens, pools[i]])
      return api.sumTokens({ ownerTokens })      
    }
  }
})