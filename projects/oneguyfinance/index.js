const PREDICTION_CONTRACT = "0x4e9f8e71DBbd9aCca9b4c7ae1c647FC1B45065FD";
const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");

async function polygon(timestamp, block, chainBlocks, { api }) {
  let maticBalance = await sdk.api.eth.getBalance({
    target: PREDICTION_CONTRACT,
    block: chainBlocks["polygon"],
    chain: "polygon",
  });

  return {
    ["polygon:" + ADDRESSES.polygon.WMATIC_1]: maticBalance.output,
  };
}

module.exports = {
  polygon: {
    tvl: polygon,
  },
  methodology: `TVL is the total amount of MATIC held on smart-contracts.`,
};
