const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { unwrapUniswapLPs, } = require("../helper/unwrapLPs");
const { getChainTransform } = require('../helper/portedTokens')

const GRAND = {
  bsc: "0xeE814F5B2bF700D2e843Dc56835D28d095161dd9",
  polygon: "0x14af08eccF4E305a332E1B7E146EbEC98A9637F0",
};

const GRANDBANKS_CONTRACT = {
  bsc: "0x3d8fd880976a3EA0f53cad02463867013D331107",
  polygon: "0xcF8070d9fbE3F96f4bFF0F90Cc84BfD30869dAF2",
  moonriver: "0xC6da8165f6f5F0F890c363cD67af1c33Bb540123",
};

const calcTvl = async (balances, banksContract, chain) => {
  let chainBlocks = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: banksContract,
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  const pids = Array.from({ length: poolLenth }, (v, i) => i);
  const lpPositions = [];
  const crvPositions = [];

  const poolInfos = (
    await sdk.api.abi.multiCall({
      calls: pids.map((pid) => ({
        target: banksContract,
        params: [pid],
      })),
      abi: abi.poolInfo,
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((response) => response.output);

  const wantBalances = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[4],
      })),
      abi: abi.wantLockedTotal,
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((response) => response.output);

  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[0],
      })),
      abi: abi.symbol,
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((response) => response.output);

  for (let index = 0; index < symbols.length; index++) {
    const poolInfo = poolInfos[index];
    const wantBalance = wantBalances[index];
    const symbol = symbols[index];
    const UNI_LP_SYMBOLS = [
      "Cake-LP",
      "APE-LP",
      "WLP",
      "BSW-LP",
      "UNI-V2",
      "DFYNLP",
      "pWINGS-LP",
      "MLP",
      "SLP",
    ];
    const CRV_LP_SYMBOLS = [
      "DOP-LP",
      "DOP-2P-LP",
      "DOP-UST-LP",
      "DOP-3P-LP",
      "3P-QLP",
      "IS3USD",
      "am3CRV",
      "btcCRV",
      "1S3P",
    ];

    if (UNI_LP_SYMBOLS.includes(symbol)) {
      lpPositions.push({
        token: poolInfo[0],
        balance: wantBalance,
      });
    } else if (symbol == "WGRAND") {
      sdk.util.sumSingleBalance(
        balances,
        `${chain}:${GRAND[chain]}`,
        wantBalance
      );
    } else if (CRV_LP_SYMBOLS.includes(symbol)) {
      crvPositions.push({
        token: poolInfo[0],
        balance: wantBalance,
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `${chain}:${poolInfo[0]}`,
        wantBalance
      );
    }
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
  );

  const transform = await getChainTransform(chain)

  await Promise.all(
    crvPositions.map(async (crv) => {
      sdk.util.sumSingleBalance(balances,crv.token,crv.balance, chain)
    })
  );
};

const bscTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};
  await calcTvl(balances, GRANDBANKS_CONTRACT.bsc, "bsc");
  return balances;
};

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};
  await calcTvl(balances, GRANDBANKS_CONTRACT.polygon, "polygon");
  return balances;
};

const moonriverTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};
  await calcTvl(balances, GRANDBANKS_CONTRACT.moonriver, "moonriver");
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(GRANDBANKS_CONTRACT.bsc, GRAND.bsc),
    tvl: bscTvl,
  },
  polygon: {
    staking: staking(GRANDBANKS_CONTRACT.polygon, GRAND.polygon),
    tvl: polygonTvl,
  },
  moonriver: {
    tvl: moonriverTvl,
  },
  methodology:
    "TVL counts the LP tokens that have been deposited to the protocol. The LP tokens are unwrapped and the balances are summed per token.",
};
