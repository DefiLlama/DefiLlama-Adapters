const sdk = require("@defillama/sdk");
const abis = require("./abis.json");

const validatorContract = "0x0000000000000000000000000000000000001000";
const validatorAddress = "0xb0dC7A676Ab09868eBef78E16e6AEA9e79F0f9Cf";
const CHAIN = "csc";

async function coinexTVL(timestamp, block, chainBlocks) {
  const validatorInfo = await sdk.api.abi.call({
    chain: CHAIN,
    block: block,
    target: validatorContract,
    abi: abis.find((abi) => abi.name === "getValidatorInfo"),
    params: [validatorAddress],
  });

  return {
    "0x081f67afa0ccf8c7b17540767bbe95df2ba8d97f": validatorInfo.output[2], // CET
  };
}

module.exports = {
  methodology: "Counts staked CET tokens.",
  cantRefill: true,
  csc: {
    tvl: coinexTVL,
  },
  tvl: sdk.util.sumChainTvls([coinexTVL]),
};
