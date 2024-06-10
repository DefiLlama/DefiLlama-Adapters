const sdk = require("@defillama/sdk");

const LIFT_TOKEN_CONTRACT = "0x513C3200F227ebB62e3B3d00B7a83779643a71CF";
const LIFT_STAKING_CONTRACT = "0x49C5b5f3aba18A4bCcF57AA1567ac5Bd46e82381";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = i => `bsc:${i}`;

  const collateralBalance = (
    await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: "bsc",
      target: LIFT_TOKEN_CONTRACT,
      params: [LIFT_STAKING_CONTRACT],
      block: chainBlocks["bsc"],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    transform(LIFT_TOKEN_CONTRACT),
    collateralBalance
  );

  return balances;
}

module.exports = {
      methodology: "Counts the number of LIFT tokens in the Staking contract",
  start: 1637191200,
  bsc: {
    tvl: () => ({}),
    staking: tvl,
  }
};
