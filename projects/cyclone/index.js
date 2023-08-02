const ADDRESSES = require('../helper/coreAssets.json')
const contracts = require("./contracts.json");
const { pool2 } = require("./../helper/pool2");
const { staking } = require(".././helper/staking.js");
const {
  sumTokens2, nullAddress, 
} = require("./../helper/unwrapLPs");
const {sumTokensExport} = require("./../helper/unknownTokens");

function tvl(chain, gasToken) {
  return async (timestamp, block, chainBlocks) => {
    block = chainBlocks[chain]
    const toa = []

    for (let contract of Object.entries(contracts[chain])) {
      if (contract[0] == "pool2" || contract[0] == "staking") {
        continue;
      } else if (contract[1].token == "") {
        toa.push([nullAddress, contract[1].address])
      } else {
        toa.push([contract[1].token, contract[1].address])
      }
    }
    return sumTokens2({ tokensAndOwners: toa, chain, block, })
  };
}

module.exports = {
  iotex: {
    tvl: tvl("iotex", "iotex"),
    pool2: sumTokensExport({ owner: contracts.iotex.pool2.address, tokens: [contracts.iotex.pool2.token], }),
    staking: staking(contracts.iotex.staking.address, contracts.iotex.staking.token, "iotex", "cyclone-protocol", 18),
  },
  ethereum: {
    tvl: tvl("ethereum", ADDRESSES.ethereum.WETH),
    pool2: pool2(contracts.ethereum.pool2.address, contracts.ethereum.pool2.token, "ethereum"),
  },
  bsc: {
    tvl: tvl("bsc", "bsc:" + ADDRESSES.bsc.WBNB),
    pool2: pool2(contracts.bsc.pool2.address, contracts.bsc.pool2.token, "bsc"),
    staking: staking(contracts.bsc.staking.address, contracts.bsc.staking.token, "bsc", "cyclone-protocol", 18),
  },
  polygon: {
    tvl: tvl("polygon", "polygon:" + ADDRESSES.polygon.WMATIC_2),
    pool2: pool2(contracts.polygon.pool2.address, contracts.polygon.pool2.token,),
  },
};
