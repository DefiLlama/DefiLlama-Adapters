const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs, unwrapCrv } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const GRAND = "0xeE814F5B2bF700D2e843Dc56835D28d095161dd9";
const GRANDBANKS_CONTRACT = "0x3d8fd880976a3EA0f53cad02463867013D331107";

const bscTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: GRANDBANKS_CONTRACT,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const pids = Array.from({length: poolLenth}, (v, i) => i)
  const lpPositions = [];
  const crvPositions = [];

  const poolInfos = (
    await sdk.api.abi.multiCall({
      calls: pids.map((pid) => ({
        target: GRANDBANKS_CONTRACT,
        params: [pid]
      })),
      abi: abi.poolInfo,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((response) => response.output);

  const wantBalances = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[4]
      })),
      abi: abi.wantLockedTotal,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((response) => response.output);

  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((poolInfo) => ({
        target: poolInfo[0]
      })),
      abi: abi.symbol,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((response) => response.output);

  for (let index = 0; index < symbols.length; index++) {
    const poolInfo = poolInfos[index]
    const wantBalance = wantBalances[index]
    const symbol = symbols[index]

    if (symbol == "Cake-LP" || symbol == "APE-LP" || symbol == "WLP" || symbol == "BSW-LP") {
      lpPositions.push({
        token: poolInfo[0],
        balance: wantBalance,
      });
    } else if (symbol == "WGRAND") {
      sdk.util.sumSingleBalance(balances, `bsc:${GRAND}`, wantBalance);
    } else if (
      symbol == 'DOP-LP' ||
      symbol == 'DOP-2P-LP' ||
      symbol == 'DOP-UST-LP' ||
      symbol == 'DOP-3P-LP' ||
      symbol == '3P-QLP'
    ) {
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
    crvPositions.map(async crv => {
      await unwrapCrv(balances, crv.token, crv.balance, chainBlocks['bsc'], 'bsc', transformAddress)
    }),
  )

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
