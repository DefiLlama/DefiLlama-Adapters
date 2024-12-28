const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasury = "0xe6a7338cba0a1070adfb22c07115299605454713"
const treasury2 = "0x91c9d4373b077ef8082f468c7c97f2c499e36f5b"
const knc = "0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202"
const kncarb = "0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB"
const kncop = "0xa00E3A3511aAC35cA78530c85007AFCd31753819"
const kncbsc= "0xfe56d5892BDffC7BF58f2E84BE1b2C32D21C308b"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT

     ],
    owners: [treasury, treasury2],
    ownTokens: [knc],
  },
  arbitrum: {
    tokens: [ 
       ADDRESSES.arbitrum.ARB,
       ADDRESSES.arbitrum.WBTC,
       ADDRESSES.arbitrum.USDC,
       ADDRESSES.arbitrum.USDC_CIRCLE,
       "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d" //MAI
     ],
    owners: [treasury2],
    ownTokens: [kncarb],
  },
  optimism: {
    tokens: [ 
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.WETH,
        "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4"
     ],
    owners: [treasury2],
    ownTokens: [kncop],
  },
  bsc: {
    tokens: [ 
         ADDRESSES.bsc.WBNB
     ],
    owners: [treasury2],
    ownTokens: [kncbsc],
  },
})