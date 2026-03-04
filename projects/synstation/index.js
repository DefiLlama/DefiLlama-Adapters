const { sumUnknownTokens } = require("../helper/unknownTokens")


const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require("../helper/utils")

const config = {
   ethereum: {preStaking:"0x3BaC111A6F5ED6A554616373d5c7D858d7c10d88"},
   astar: {preStaking:"0xe9B85D6A1727d4B22595bab40018bf9B7407c677"},
  soneium: {
    vaults: [
    "0x3BaC111A6F5ED6A554616373d5c7D858d7c10d88", // astar,
    "0x2C7f58d2AfaCae1199c7e1E00FB629CCCEA5Bbd5", // usdc.e
    "0x6A31048E5123859cf50F865d5a3050c18E77fFAe", // usdt
    "0xefb3Cc73a5517c9825aE260468259476e7965c5E", // weth
    "0x74dFFE1e68f41ec364517f1F2951047246c5DD4e", // nsASTR
    "0x467b43ede72543FC0FD79c7085435A484a87e0D7", // nrETH
    "0xF8cCfCD56a744B620f20472e467b8Bc0dd2EAA23", // wstASTR vault
  ],
    v3Factory: "0x81B4029bfCb5302317fe5d35D54544EA3328e30f"
}
}


const exportsData =  Object.keys(config).map((chain) => {
  return {[chain] : {
    tvl: async (api) => {
      const results = [];

      const vaults = config[chain].vaults;
      if(vaults) {
        const data =await api.multiCall({  abi: 'address:asset', calls: vaults, permitFailure: true, })
        const tokens = data;
        const bals = await api.multiCall({  abi: 'uint256:totalAssets', calls: vaults, permitFailure: true, })
        bals.forEach((v, i) => v && api.add(tokens[i], v))
      }
      
      const prestakingAddress = config[chain].preStaking;
      if(prestakingAddress) {

        const data = await api.fetchList({  lengthAbi: 'uint256:poolLength', itemAbi: 'function poolInfo(uint256) view returns (address want, uint256 totalDeposited,uint256,uint256)', target: prestakingAddress, })
        const tokens = data.map(i => i.want)
        const bals  = data.map(i => i.totalDeposited)
        bals.forEach((v, i) => v && api.add(tokens[i], v))
      }
        return (sumUnknownTokens({ api, resolveLP: false, useDefaultCoreAssets: true, }))

    }
  }
}
})
exportsData.push(uniV3Export({
    soneium: { factory: config.soneium.v3Factory, fromBlock: 1812231 },
}))


module.exports = mergeExports(exportsData);