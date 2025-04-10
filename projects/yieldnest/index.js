
const ADDRESSES = require('../helper/coreAssets.json')

const YN_ETH = '0x09db87a538bd693e9d08544577d5ccfaa6373a48'
const yn_ETHx = '0x657d9ABA1DBb59e53f9F3eCAA878447dCfC96dCb'

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: async (api) => {
      const ynethBalance = await api.call({ abi: 'uint256:totalAssets', target: YN_ETH })
      api.add(ADDRESSES.null, ynethBalance)
      const lsdRegistry = '0x323C933df2523D5b0C756210446eeE0fB84270fd'
      const lsds = await api.call({ abi: 'address[]:getAssets', target: lsdRegistry })
      const bals = await api.call({ abi: 'function getAllAssetBalances() view returns (uint256[])', target: lsdRegistry })
      api.add(lsds, bals)
      const maxethBalance = await api.call({ abi: 'uint256:totalAssets', target: yn_ETHx })
      api.add(ADDRESSES.null, maxethBalance)
      
    }
  },
  bsc: {
    tvl: async (api) => {
      const ynBNB = '0x304B5845b9114182ECb4495Be4C91a273b74B509'
      const ynBTCk = '0x78839cE14a8213779128Ee4da6D75E1326606A56'
      const ynBNBx = '0x32C830f5c34122C6afB8aE87ABA541B7900a2C5F'
      const ynCoBTCk = '0x132376b153d3cFf94615fe25712DB12CaAADf547'
      const ynBfBTCk = '0x1B015705214bdcAAf43E8EDeCa13023143224Ab7'
  
      return api.erc4626Sum({ calls: [ynBNB, ynBTCk, ynBNBx, ynCoBTCk, ynBfBTCk], isOG4626: true})
    }
  },
}
