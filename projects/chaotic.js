const sdk = require("@defillama/sdk");
const getReserves = require("./helper/abis/getReserves.json");
const BigNumber = require("bignumber.js");
const { getBlock } = require("./helper/getBlock");

const CollateralSystemAddress = "0x78D4664408c06F2BeDc4f108f3Fc8f0AB017a0AE";
const RewardLockerAddress = "0xe8091cA33a5658ba01eb59bD738D1cb590493aE9";

const MovrChaosPoolAddress = "0x8d341E5E955E936B45B29dbF49960b8538FCA978";
const MovrUsdcPoolAddress = "0xe537f70a8b62204832B8Ba91940B77d3f79AEb81";

const tokens = {
  CHAOS: "0xf4c6850B6e3288E81Be542909b76865a0BdF9585",
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const moonriverBlock = await getBlock(timestamp, "moonriver", chainBlocks);

  const stakedChaos = await sdk.api.abi.call({
    chain: "moonriver",
    moonriverBlock,
    target: tokens["CHAOS"],
    params: CollateralSystemAddress,
    abi: "erc20:balanceOf",
  });
  const lockedChaos = await sdk.api.abi.call({
    chain: "moonriver",
    moonriverBlock,
    target: tokens["CHAOS"],
    params: RewardLockerAddress,
    abi: "erc20:balanceOf",
  });

  // token0: WMOVR. token1: CHAOS
  const movrChaosPoolReserves = await sdk.api.abi.call({
    chain: "moonriver",
    moonriverBlock,
    target: MovrChaosPoolAddress,
    params: [],
    abi: getReserves,
  });

  // token0: WMOVR. token1: USDC
  const movrUsdcPoolReserves = await sdk.api.abi.call({
    chain: "moonriver",
    moonriverBlock,
    target: MovrUsdcPoolAddress,
    params: [],
    abi: getReserves,
  });

  const totalChaos = new BigNumber(stakedChaos.output).plus(
    new BigNumber(lockedChaos.output)
  );

  // Calculate USD value of CHAOS via Solarbeam
  const totalMovrValue = totalChaos
    .times(movrChaosPoolReserves.output._reserve0)
    .div(movrChaosPoolReserves.output._reserve1);
  const totalUsdcValue = totalMovrValue
    .times(movrUsdcPoolReserves.output._reserve1)
    .div(movrUsdcPoolReserves.output._reserve0);

  balances["usd-coin"] = totalUsdcValue.div("1000000").toNumber();

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl,
  },
};
