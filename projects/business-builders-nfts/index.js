const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { utils } = require("ethers");

const factoryABI = require("../helper/abis/factory.json");
const tokenABI = require("../helper/abis/erc20.json");

const { toUSDTBalances } = require("../helper/balances");
const { sumChainTvls } = require("@defillama/sdk/build/generalUtil");

const METER_FTB_CONTRACT = "0x6cfe9adad5215195c1aa9755daed29360e6ab986";
const METER_REWARDS_CONTRACT = "0x103ed6fb861a2651ff59f0852d3739c18d45cd9b";
const METER_FTB_MTRG_CONTRACT = "0x88cdb3e764dedcc2e3a1642957ebd513765b252a";
const METER_MTRG_BUSD_CONTRACT = "0x4A74C4110726Ac162558062250c671B2BdB17c07";

const POLYGON_FTB_CONTRACT = "0xF305012EA754252184f1071C86ae99fAc5B40320";
const POLYGON_REWARDS_CONTRACT = "0x0455e50b2822e6f3d8dc01246aca8378a8992466";
const POLYGON_FTB_MATIC_CONTRACT = "0x1Df39b565652eACa24dfB16A07dcfe4d7f8f02c3";
const POLYGON_MATICUSDC_CONTRACT = "0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827";

const meterGetFTBValueOnUSD = async () => {
  const FTBMTRG = (
    await sdk.api.abi.call({
      abi: factoryABI.getReserves,
      target: METER_FTB_MTRG_CONTRACT,
      chain: "meter",
    })
  ).output;

  const MTRGBUSD = (
    await sdk.api.abi.call({
      abi: factoryABI.getReserves,
      target: METER_MTRG_BUSD_CONTRACT,
      chain: "meter",
    })
  ).output;

  return (
    ((Number(utils.formatEther(MTRGBUSD[1])) /
      Number(utils.formatEther(MTRGBUSD[0]))) *
      Number(utils.formatEther(FTBMTRG[0]))) /
    Number(utils.formatEther(FTBMTRG[1]))
  );
};

const polygonGetFTBValueOnUSD = async () => {
  const FTBMATIC = (
    await sdk.api.abi.call({
      abi: factoryABI.getReserves,
      target: POLYGON_FTB_MATIC_CONTRACT,
      chain: "polygon",
    })
  ).output;

  const MATICUSDC = (
    await sdk.api.abi.call({
      abi: factoryABI.getReserves,
      target: POLYGON_MATICUSDC_CONTRACT,
      chain: "polygon",
    })
  ).output;

  return (
    (((Number(utils.formatEther(MATICUSDC[1])) * Math.pow(10, 12)) /
      Number(utils.formatEther(MATICUSDC[0]))) *
      Number(utils.formatEther(FTBMATIC[0]))) /
    Number(utils.formatEther(FTBMATIC[1]))
  );
};

const _meterStaking = async (timestamp, block, chainBlocks) => {
  const TOTAL_FTB_ON_REWARDS_POOL = (
    await sdk.api.erc20.balanceOf({
      target: METER_FTB_CONTRACT,
      owner: METER_REWARDS_CONTRACT,
      chain: "meter",
      block: chainBlocks["meter"],
    })
  ).output;

  return toUSDTBalances(
    Number(utils.formatEther(TOTAL_FTB_ON_REWARDS_POOL)) *
      (await meterGetFTBValueOnUSD())
  );
};

const _meterPool2 = async (timestamp, block, chainBlocks) => {
  const FTBMTRG = (
    await sdk.api.abi.call({
      abi: factoryABI.getReserves,
      target: METER_FTB_MTRG_CONTRACT,
      chain: "meter",
    })
  ).output;

  return toUSDTBalances(
    Number(utils.formatEther(FTBMTRG[1])) * (await meterGetFTBValueOnUSD())
  );
};

const _polygonStaking = async (timestamp, block, chainBlocks) => {
  const TOTAL_FTB_ON_REWARDS_POOL = (
    await sdk.api.erc20.balanceOf({
      target: POLYGON_FTB_CONTRACT,
      owner: POLYGON_REWARDS_CONTRACT,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  return toUSDTBalances(
    Number(utils.formatEther(TOTAL_FTB_ON_REWARDS_POOL)) *
      (await polygonGetFTBValueOnUSD())
  );
};

const _polygonPool2 = async (timestamp, block, chainBlocks) => {
  const FTB_MATIC = (
    await sdk.api.abi.call({
      abi: factoryABI.getReserves,
      target: POLYGON_FTB_MATIC_CONTRACT,
      chain: "polygon",
    })
  ).output;

  return toUSDTBalances(
    Number(utils.formatEther(FTB_MATIC[1])) * (await polygonGetFTBValueOnUSD())
  );
};

module.exports = {
  misrepresentedTokens: true,
  meter: {
    staking: _meterStaking,
    pool2: _meterPool2,
    tvl: sumChainTvls([_meterStaking, _meterPool2]),
  },
  polygon: {
    staking: _polygonStaking,
    pool2: _polygonPool2,
    tvl: sumChainTvls([_polygonStaking, _polygonPool2]),
  },
  methodology: `Staking: we include locked tokens on the rewards contracts as staking.\n
   Pool2: Relation between liquidity, token value and total tokens on the liquidity pools.\n
   TVL: Based on the staking and pool2 summation including rewards storage and market liquidity tokens.`,
};
