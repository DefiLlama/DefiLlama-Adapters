const { uniV3Export } = require('../uniswapV3')

const uniV3Configs = {
  "blasterswap-v3": { blast: { factory: "0x1A8027625C830aAC43aD82a3f7cD6D5fdCE89d78", fromBlock: 4308657 } },
  "comet-swap-v3": { astar: { factory: "0x2C1EEf5f87F4F3194FdAAfa20aE536b1bA49863b", fromBlock: 12168518 } },
  "warpx-v3": { megaeth: { factory: "0xf67cF9d6FC433e97Ec39Ae4b7E4451B56B171C8a", fromBlock: 4630394 } },
  "sailfish-v3": { occ: { factory: "0x963A7f4eB46967A9fd3dFbabD354fC294FA2BF5C", fromBlock: 142495 } },
  "tradegpt": { "0g": { factory: "0x6F3945Ab27296D1D66D8EEb042ff1B4fb2E0CE70", fromBlock: 5711733 } },
  "ultrasolid-v3": { hyperliquid: { factory: "0xD883a0B7889475d362CEA8fDf588266a3da554A1", fromBlock: 10742640 } },
  "juiceswap": { citrea: { factory: "0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82", fromBlock: 2651539 } },
  "weero-v3": { klaytn: { factory: "0x6603E53b4Ae1AdB1755bAF62BcbF206f90874178", fromBlock: 186673202 } },
}

const protocols = {}
Object.entries(uniV3Configs).forEach(([name, config]) => {
  protocols[name] = uniV3Export(config)
})

module.exports = protocols
