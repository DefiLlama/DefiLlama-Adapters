const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { pool2Exports } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const chargeTokenAddress = "0x1C6bc8e962427dEb4106aE06A7fA2d715687395c";

const staticBUSDLpAddress = "0x69758726b04e527238B261ab00236AFE9F34929D";
const chargeBUSDLpAddress = "0xB73b4eeb4c4912C1d1869219A22660eB478B57eA";

const chargeBoardroomAddress = "0x53D55291c12EF31b3f986102933177815DB72b3A";
const staticBUSDBoardroomAddress = "0x7692bCB5F646abcdFA436658dC02d075856ac33C";

const chargeBUSDFarmStrategyAddress = "0xA1Be11eAB62283E9719021aCB49400F6d5918153";
const staticBUSDFarmStrategyAddress = "0x53eE388f037876850D4fd60307FBA02e203A1C0e";


async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  let lpPositions = [];
  let transformAddress = i => `bsc:${i}`;

  // Static-BUSD Boardroom TVL
  const staticBUSDBoardroomBalance = sdk.api.erc20
    .balanceOf({
      target: staticBUSDLpAddress,
      owner: staticBUSDBoardroomAddress,
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

  lpPositions.push({
    token: staticBUSDLpAddress,
    balance: (await staticBUSDBoardroomBalance).output,
  });

  // Charge Farms Static-BUSD TVL
  const chargeFarmStaticBUSDBalance = sdk.api.erc20
    .balanceOf({
      target: staticBUSDLpAddress,
      owner: staticBUSDFarmStrategyAddress,
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

  lpPositions.push({
    token: staticBUSDLpAddress,
    balance: (await chargeFarmStaticBUSDBalance).output,
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );
  return balances;
}

module.exports = {
  methodology: 'The TVL of Charge Defi is calculated using the Pancake LP token deposits (Static/BUSD and Charge/BUSD) in the farms, and the Charge & Static-BUSD deposits found in each Boardroom.',
  bsc: {
    tvl,
    pool2: pool2Exports(
      chargeBUSDFarmStrategyAddress,
      [chargeBUSDLpAddress],
      "bsc"
    ),
    staking: staking(chargeBoardroomAddress, chargeTokenAddress),

  },
};
