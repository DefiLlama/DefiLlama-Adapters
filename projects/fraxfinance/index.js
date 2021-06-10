const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

// --- ABI's section ---
const curveamoABI = require("./curveamo.json");
const vefxsABI = require("./vefxs.json");
const usdcPoolABI = require("./usdcpool.json");
const stakingcontratABI = require("./stakingcontract.json");

const BigNumber = require("bignumber.js");

const USDC_ETH = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const FXS_ETH = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";

const CURVE_AMO = "0x72170Cdc48C33a6AE6B3E83CD387ca3Fb9105da2";
const veFXS = "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0";
const USDC_POOL = "0x1864Ca3d47AaB98Ee78D11fc9DCC5E7bADdA1c0d";
const INVESTOR_COLLATERAL_POOL = "0xEE5825d5185a1D512706f9068E69146A54B6e076";
const INVESTOR_AMO_V2 = "0xB8315Af919729c823B2d996B1A6DDE381E7444f1";

const STAKING_CONTRACTS = [
  "0xD875628B942f8970De3CcEaf6417005F68540d4f",
  "0xa29367a3f057F3191b62bd4055845a33411892b6",
  "0xda2c338350a0E59Ce71CDCED9679A3A590Dd9BEC",
];

async function ethAddr() {
  return (addr) => {
    return addr;
  };
}

const ethereumTvl = async (timestamp, block) => {
  let balances = {};

  // --- CURVE AMO USDC TVL ---
  const usdValueInVault = (
    await sdk.api.abi.call({
      target: CURVE_AMO,
      abi: curveamoABI.usdValueInVault,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    USDC_ETH,
    BigNumber(usdValueInVault)
      .dividedBy(10 ** 12)
      .toFixed(0)
  );

  // --- FXS LOCKED in escrow ---
  const fxsLocked = (
    await sdk.api.abi.call({
      target: veFXS,
      abi: vefxsABI.supply,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, FXS_ETH, fxsLocked);

  // --- USDC POOL + AMO Investor + AMO Lending TVL ---
  const usdcTvls = (
    await sdk.api.abi.multiCall({
      calls: [USDC_POOL, INVESTOR_COLLATERAL_POOL, INVESTOR_AMO_V2].map(
        (addr) => ({ target: addr })
      ),
      abi: usdcPoolABI.collatDollarBalance,
      block,
    })
  ).output.map((response) => response.output);

  for (let i = 0; i < usdcTvls.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      USDC_ETH,
      BigNumber(usdcTvls[i])
        .dividedBy(10 ** 12)
        .toFixed(0)
    );
  }

  // --- Staking (rewards FXS) ---
  const stakedBalances = (
    await sdk.api.abi.multiCall({
      calls: STAKING_CONTRACTS.map((addr) => ({ target: addr })),
      abi: stakingcontratABI.totalSupply,
      block,
    })
  ).output.map((response) => response.output);

  const stakingTokens = (
    await sdk.api.abi.multiCall({
      calls: STAKING_CONTRACTS.map((addr) => ({ target: addr })),
      abi: stakingcontratABI.stakingToken,
      block,
    })
  ).output.map((response) => response.output);

  let lpPositions = [];

  for (let i = 0; i < stakingTokens.length; i++) {
    lpPositions.push({
      token: stakingTokens[i],
      balance: stakedBalances[i],
    });
  }

  const transformAdress = await ethAddr();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    "ethereum",
    transformAdress
  );

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethereumTvl,
  },
  tvl: sdk.util.sumChainTvls([ethereumTvl]),
};
