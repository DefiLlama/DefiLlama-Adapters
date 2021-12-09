const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs, unwrapCrv } = require("../helper/unwrapLPs");
const { transformBscAddress, transformPolygonAddress 
  } = require("../helper/portedTokens");
const GRAND = {
  bsc: "0xeE814F5B2bF700D2e843Dc56835D28d095161dd9",
  polygon: "0x14af08eccF4E305a332E1B7E146EbEC98A9637F0",
};
const GRANDBANKS_CONTRACT = {
  bsc: "0x3d8fd880976a3EA0f53cad02463867013D331107",
  polygon: "0xcF8070d9fbE3F96f4bFF0F90Cc84BfD30869dAF2",
};

const bscTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: GRANDBANKS_CONTRACT.bsc,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const pids = Array.from({ length: poolLenth }, (v, i) => i);
  const lpPositions = [];
  const crvPositions = [];

  const poolInfos = (
    await sdk.api.abi.multiCall({
      calls: pids.map((pid) => ({
        target: GRANDBANKS_CONTRACT.bsc,
        params: [pid],
      })),
      abi: abi.poolInfo,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((response) => response.output);

  const wantBalances = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[4],
      })),
      abi: abi.wantLockedTotal,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((response) => response.output);

  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[0],
      })),
      abi: abi.symbol,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((response) => response.output);

  for (let index = 0; index < symbols.length; index++) {
    const poolInfo = poolInfos[index];
    const wantBalance = wantBalances[index];
    const symbol = symbols[index];
    const UNI_LP_SYMBOLS = ["Cake-LP", "APE-LP", "WLP", "BSW-LP"];
    const CRV_LP_SYMBOLS = [
      "DOP-LP",
      "DOP-2P-LP",
      "DOP-UST-LP",
      "DOP-3P-LP",
      "3P-QLP",
    ];

    if (UNI_LP_SYMBOLS.includes(symbol)) {
      lpPositions.push({
        token: poolInfo[0],
        balance: wantBalance,
      });
    } else if (symbol == "WGRAND") {
      sdk.util.sumSingleBalance(balances, `bsc:${GRAND.bsc}`, wantBalance);
    } else if (CRV_LP_SYMBOLS.includes(symbol)) {
      crvPositions.push({
        token: poolInfo[0],
        balance: wantBalance,
      });
    } else {
      sdk.util.sumSingleBalance(balances, `bsc:${poolInfo[0]}`, wantBalance);
    }
  }

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  await Promise.all(
    crvPositions.map(async (crv) => {
      await unwrapCrv(
        balances,
        crv.token,
        crv.balance,
        chainBlocks["bsc"],
        "bsc",
        transformAddress
      );
    })
  );

  return balances;
};

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: GRANDBANKS_CONTRACT.polygon,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  const pids = Array.from({ length: poolLenth }, (v, i) => i);
  const lpPositions = [];
  const crvPositions = [];

  const poolInfos = (
    await sdk.api.abi.multiCall({
      calls: pids.map((pid) => ({
        target: GRANDBANKS_CONTRACT.polygon,
        params: [pid],
      })),
      abi: abi.poolInfo,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((response) => response.output);

  const wantBalances = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[4],
      })),
      abi: abi.wantLockedTotal,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((response) => response.output);

  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[0],
      })),
      abi: abi.symbol,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((response) => response.output);

  for (let index = 0; index < symbols.length; index++) {
    const poolInfo = poolInfos[index];
    const wantBalance = wantBalances[index];
    const symbol = symbols[index];
    const UNI_LP_SYMBOLS = ["APE-LP", "UNI-V2", "SLP", "DFYNLP", "pWINGS-LP"];
    const CRV_LP_SYMBOLS = ["IS3USD", "am3CRV", "btcCRV"];

    if (UNI_LP_SYMBOLS.includes(symbol)) {
      lpPositions.push({
        token: poolInfo[0],
        balance: wantBalance,
      });
    } else if (symbol == "WGRAND") {
      sdk.util.sumSingleBalance(
        balances,
        `polygon:${GRAND.polygon}`,
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
        `polygon:${poolInfo[0]}`,
        wantBalance
      );
    }
  }

  const transformAddress = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  await Promise.all(
    crvPositions.map(async (crv) => {
      await unwrapCrv(
        balances,
        crv.token,
        crv.balance,
        chainBlocks["polygon"],
        "polygon",
        transformAddress
      );
    })
  );

  return balances;
};

module.exports = {
  methodology:
    "TVL counts the LP tokens that have been deposited to the protocol. The LP tokens are unwrapped and the balances are summed per token.",
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl]),
};
