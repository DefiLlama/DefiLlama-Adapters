const ADDRESSES = require('../helper/coreAssets.json')

const RCOIN = "0x252739487c1fa66eaeae7ced41d6358ab2a6bca9"

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const [usdcDecimals, rcoinDecimals,totalSupply] = await Promise.all([
        api.call({target: ADDRESSES.ethereum.USDC, abi:'erc20:decimals'}),
        api.call({target: RCOIN, abi:'erc20:decimals'}),
        api.call({target: RCOIN, abi:'erc20:totalSupply'})
    ])
      // Adjusting the total supply of RCOIN to match the decimal places of USDC
      // USDC has 6 decimals, whereas RCOIN has 8 decimals
      const rcoinDecimalAdjustment = Math.pow(10, usdcDecimals) / Math.pow(10, rcoinDecimals);
      const adjustedSupply = totalSupply * rcoinDecimalAdjustment
      
      return api.add(ADDRESSES.ethereum.USDC, adjustedSupply)
    }
  }
}