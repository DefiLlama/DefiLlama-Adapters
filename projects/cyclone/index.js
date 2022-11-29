const contracts = require("./contracts.json");
const { pool2 } = require("./../helper/pool2");
const { staking } = require(".././helper/staking.js");
const {
  sumLPWithOnlyOneTokenOtherThanKnown, sumTokens2, nullAddress
} = require("./../helper/unwrapLPs");

const wiotx = "0xA00744882684C3e4747faEFD68D283eA44099D03";

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

async function iotexPool2(timestamp, block, chainBlocks) {
  block = chainBlocks.iotex
  const balances = {};
  let a = await sumLPWithOnlyOneTokenOtherThanKnown(
    balances,
    contracts.iotex.pool2.token,
    contracts.iotex.pool2.address,
    "0x4d7b88403aa2f502bf289584160db01ca442426c",
    block,
    "iotex"
  );
  return { iotex: balances[wiotx] / 10 ** 18 };
}

module.exports = {
  iotex: {
    tvl: tvl("iotex", "iotex"),
    pool2: iotexPool2,
    staking: staking(
      contracts.iotex.staking.address,
      contracts.iotex.staking.token,
      "iotex",
      "cyclone-protocol",
      18
    ),
  },
  ethereum: {
    tvl: tvl("ethereum", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    pool2: pool2(
      contracts.ethereum.pool2.address,
      contracts.ethereum.pool2.token,
      "ethereum"
    ),
  },
  bsc: {
    tvl: tvl("bsc", "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"),
    pool2: pool2(contracts.bsc.pool2.address, contracts.bsc.pool2.token, "bsc"),
    staking: staking(
      contracts.bsc.staking.address,
      contracts.bsc.staking.token,
      "bsc",
      "cyclone-protocol",
      18
    ),
  },
  polygon: {
    tvl: tvl("polygon", "polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"),
    pool2: pool2(
      contracts.polygon.pool2.address,
      contracts.polygon.pool2.token,
      "polygon"
    ),
  },
};
