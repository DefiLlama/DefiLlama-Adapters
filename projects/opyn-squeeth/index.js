const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const START_BLOCK = 13982541;
const controller = "0x64187ae08781B09368e6253F9E94951243A493D5".toLowerCase();
const ETH = ADDRESSES.null;
const WETH = ADDRESSES.ethereum.WETH.toLowerCase();

const uniPool = '0x82c427adfdf2d245ec51d8046b41c4ee87f0d29c';


module.exports = {
  ethereum: {
    tvl: async (api)=> {
      let balances = {};
      const { block } = api
  
      if(!block || block >= START_BLOCK) {
  
        return sumTokens2({ api, tokensAndOwners: [
          [ETH, controller],
          [WETH, uniPool],
        ]})
      }
  
      return balances;
    }
  },
  hallmarks: [
    [1643053740, "Crab v1 launch"],
    [1659055140, "Crab v2 launch"],
    [1671221995, "Zen Bull launch"]
  ]
};