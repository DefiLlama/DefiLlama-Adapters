const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const AXION = "0x839F1a22A59eAAf26c85958712aB32F80FEA23d9";
const MANAGER = "0x5F95DB799CecD1E9d95f66bA36a88A9a571Db9cD";
async function staking(timestamp, block, chainBlocks) {
  const stats = await sdk.api.abi.call({
    target: MANAGER,
    block: chainBlocks.polygon,
    abi: abi.getStatFields,
    chain: "polygon",
  });

  return {
    // Add 12 0's since total staked amount is 6 decimals, but token amount is 18 decimals
    [`polygon:${AXION}`]: `${stats.output.totalStakedAmount}000000000000`,
  };
}

const BTC = ADDRESSES.polygon.WBTC;
const VC = "0x660B71C03C15B24EFa800F2454540CD9011E40cB";
async function tvl(timestamp, block, chainBlocks) {
  const stats = await sdk.api.abi.call({
    target: BTC,
    block: chainBlocks.polygon,
    abi: abi.balanceOf,
    params: VC,
    chain: "polygon",
  });

  return {
    [`polygon:${BTC}`]: stats.output,
  };
}

module.exports = {
  polygon: {
    staking,
    tvl,
  },
};
