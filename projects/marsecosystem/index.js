const sdk = require("@defillama/sdk");
const utils = require('../helper/utils');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const abi = require("./abi.json");

const url = 'https://api.marsecosystem.com/api/pools';

async function tvl(timestamp, chainBlocks) {
  let balances = {};

  const rows = (await utils.fetchURL(url)).data;
  const localPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster'));
  const remotePools = rows.filter(v => v.masterChef.includes('MarsFarmV2'));

  const localPoolsBalances = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: localPools.map(v => ({ target: v.address, params: v.masterChefAddress })),
      abi: 'erc20:balanceOf',
      chain: "bsc",
    })
  ).output.map(v => v.output);

  const transformAdress = await transformBscAddress();

  const lpPositions = [];

  localPools.map((v, i) => {
    if (v.baseToken == v.quoteToken) {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${v.address}`,
        localPoolsBalances[i]
      );
    } else {
      lpPositions.push({
        token: v.address,
        balance: localPoolsBalances[i]
      });
    }
  });

  const remotePoolsBalances = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: remotePools.map(v => ({ target: v.masterChefAddress, params: [ v.pid ] })),
      abi: abi.sharesTotal,
      chain: "bsc",
    })
  ).output.map(v => v.output);

  remotePools.map((v, i) => {
    if (v.baseToken == v.quoteToken) {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${v.address}`,
        remotePoolsBalances[i]
      );
    } else {
      lpPositions.push({
        token: v.address,
        balance: remotePoolsBalances[i]
      });
    }
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAdress
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl
  },
  tvl
};
