const { sumTokens2 } = require('../helper/unwrapLPs')

const START_BLOCK = 13982541;
const controller = "0x64187ae08781B09368e6253F9E94951243A493D5".toLowerCase();
const ETH = '0x0000000000000000000000000000000000000000';
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();

const uniPool = '0x82c427adfdf2d245ec51d8046b41c4ee87f0d29c';


module.exports = {
  ethereum: {
    tvl: async (timestamp, block, _, { api })=> {
      let balances = {};
  
      if(block >= START_BLOCK) {
  
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