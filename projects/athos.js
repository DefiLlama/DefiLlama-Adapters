const sdk = require("@defillama/sdk");
const getReserves = require("./helper/abis/getReserves.json");
const BigNumber = require("bignumber.js");
const { getBlock } = require("./helper/http");

const CollateralSystemAddress = "0x2dfdB2E340eAdB2e29117A2b31C139fE81C550a9";

const GlmrAthPoolAddress = "0x420aaA13722A191765D86bc55212A54D9f8b5ceb";
const GlmrUsdcPoolAddress = "0x555B74dAFC4Ef3A5A1640041e3244460Dc7610d1";

const tokens = {
  ATH: "0xCBABEe0658725b5B21e1512244734A5D5C6B51D6",
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const moonbeamBlock = await getBlock(timestamp, "moonbeam", chainBlocks);
  const stakedAth = await sdk.api.abi.call({
    chain: "moonbeam",
    block: moonbeamBlock,
    target: tokens["ATH"],
    params: CollateralSystemAddress,
    abi: "erc20:balanceOf",
  });

  // token0: WGLMR. token1: ATH
  const glmrAthPoolReserves = await sdk.api.abi.call({
    chain: "moonbeam",
    block: moonbeamBlock,
    target: GlmrAthPoolAddress,
    params: [],
    abi: getReserves,
  });

  // token0: USDC. token1: WGLMR
  const glmrUsdcPoolReserves = await sdk.api.abi.call({
    chain: "moonbeam",
    block: moonbeamBlock,
    target: GlmrUsdcPoolAddress,
    params: [],
    abi: getReserves,
  });

  const totalAth = new BigNumber(stakedAth.output);

  // Calculate USD value of ATH via StellaSwap
  const totalGlmrValue = totalAth
    .times(glmrAthPoolReserves.output._reserve0)
    .div(glmrAthPoolReserves.output._reserve1);
  const totalUsdcValue = totalGlmrValue
    .times(glmrUsdcPoolReserves.output._reserve0)
    .div(glmrUsdcPoolReserves.output._reserve1);

  balances["usd-coin"] = totalUsdcValue.div("1000000").toNumber();
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  moonbeam: {
    tvl,
  },
};
