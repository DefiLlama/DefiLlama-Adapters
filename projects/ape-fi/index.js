const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { ethers, BigNumber } = require("ethers");
const { formatUnits, parseUnits } = ethers.utils;
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");
const { sumTokens } = require("../helper/unwrapLPs");

const POOL_STAKING_CONTRACTS = [
  "0xbcc28F6BA03642B9B5a3E7ad5C8f27991576796c",
  "0x0a2c0A2033EcCC7CC57e42901f04B96972131579",
];

const LP_ADDRESSES = [
  "0xfB7A3798c6FFF187C8CF08c0b1322b52cfa70AcE",
  "0x84ab278A8140A8a9759de17895a8Da8D756618f3",
];

const APE = "0x4d224452801ACEd8B2F0aebE155379bb5D594381";
const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const crvFRAX = "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC";
const crvFRAXSwap = "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2";
const apeUSDCrvFrax = "0x04b727C7e246CA70d496ecF52E6b6280f3c8077D";
const amoV2 = "0x8E252A679C87313Ccefc9559F4f1c0e4062390B5";
const multisig = "0x02ca76e87779412a77ee77c3600d72f68b9ea68c";
const convexRewardPool = "0x51e6B84968D56a1E5BC93Ee264e95b1Ea577339c";
const fraxStakingWrapper = "0x6a20FC1654A2167d00614332A5aFbB7EBcD9d414";
const fraxFarm = "0xa810D1268cEF398EC26095c27094596374262826";

const apeAPE = "0xcaB90816f91CC25b04251857ED6002891Eb0D6Fa";

const e18 = parseUnits("1", 18);

const tvl = async (timestamp, block) => {
  const balances = {};

  const apeBalance = await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    target: APE,
    params: apeAPE,
    block: block,
  });

  sdk.util.sumSingleBalance(balances, APE, apeBalance.output);

  const totalSupplies = await sdk.api.abi.multiCall({
    calls: [apeUSDCrvFrax, crvFRAX].map((addr) => ({
      target: addr,
    })),
    abi: "erc20:totalSupply",
    block: block,
  });

  const lpBalances = await sdk.api.abi.multiCall({
    calls: [
      {
        target: crvFRAX,
        params: apeUSDCrvFrax,
      },
      {
        target: convexRewardPool,
        params: amoV2,
      },
      {
        target: convexRewardPool,
        params: multisig,
      },
      {
        target: convexRewardPool,
        params: fraxStakingWrapper,
      },
    ],
    abi: "erc20:balanceOf",
    block: block,
  });

  const poolBalances = await sdk.api.abi.multiCall({
    calls: [FRAX, USDC].map((addr) => ({ target: addr, params: crvFRAXSwap })),
    abi: "erc20:balanceOf",
    block: block,
  });

  const crvFraxTotalSupply = totalSupplies.output[1].output;
  const crvFraxBalance = lpBalances.output[0].output;
  const fraxBalance = poolBalances.output[0].output;
  const usdcBalance = poolBalances.output[1].output;

  const apeUSDCrvFraxTotalSupply = totalSupplies.output[0].output;
  const amoV2LPBalance = lpBalances.output[1].output;
  const multisigLPBalance = lpBalances.output[2].output;
  const stakedLPBalance = lpBalances.output[3].output;

  const apeUSDCrvFraxShare = BigNumber.from(amoV2LPBalance)
    .add(multisigLPBalance)
    .add(stakedLPBalance)
    .mul(e18)
    .div(apeUSDCrvFraxTotalSupply);

  const crvFraxShare = BigNumber.from(crvFraxBalance)
    .mul(e18)
    .div(crvFraxTotalSupply);

  const fraxShare = crvFraxShare
    .mul(apeUSDCrvFraxShare)
    .div(e18)
    .mul(fraxBalance)
    .div(e18);

  const usdcShare = crvFraxShare
    .mul(apeUSDCrvFraxShare)
    .div(e18)
    .mul(usdcBalance)
    .div(e18);

  sdk.util.sumSingleBalance(balances, FRAX, fraxShare);
  sdk.util.sumSingleBalance(balances, USDC, usdcShare);

  return balances;
};

module.exports = {
  timetravel: true,
  ethereum: {
    pool2: pool2s(POOL_STAKING_CONTRACTS, LP_ADDRESSES),
    tvl: tvl,
  },
  start: 15688276,
  methodology:
    "Counts liquidity as the Collateral APE and USDC & FRAX on all AMOs through their contracts",
};
