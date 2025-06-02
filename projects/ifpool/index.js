const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const validatorContract = ADDRESSES.findora.FRA;
const validatorAddress = "0xb0dC7A676Ab09868eBef78E16e6AEA9e79F0f9Cf";
const CHAIN = "csc";

async function coinexTVL(timestamp, _, chainBlocks) {
  const block = chainBlocks[CHAIN]
  const validatorInfo = await sdk.api.abi.call({
    chain: CHAIN,
    block: block,
    target: validatorContract,
    abi: 'function getValidatorInfo(address validator) view returns (address, uint8, uint256, uint256, uint256, uint256, address[])',
    params: [validatorAddress],
  });

  return {
    [`csc:${ADDRESSES.findora.WCET}`]: validatorInfo.output[2], // CET
  };
}

module.exports = {
  methodology: "Counts staked CET tokens.",
  timetravel: false,
  csc: {
    tvl: coinexTVL,
  },
};
