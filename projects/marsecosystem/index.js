const sdk = require("@defillama/sdk");
const utils = require('../helper/utils');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");
const abi = require("./abi.json");

const url = 'https://api.marsecosystem.com/api/pools';

async function tvl(timestamp, chainBlocks) {
  const rows = (await utils.fetchURL(url)).data;
  const localPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster') && !(v.baseToken == 'xms' && v.quoteToken == 'xms' ));
  const remotePools = rows.filter(v => v.masterChef.includes('MarsFarmV2'));
  return await calculate(chainBlocks, localPools, remotePools);
};

async function staking(timstamp, chainBlocks) {
  const balances = {};
  const rows = (await utils.fetchURL(url)).data;
  const stakingPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster') && v.baseToken == 'xms' && v.quoteToken == 'xms');

  const stakingPoolsBalances = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: stakingPools.map(v => ({ target: v.masterChefAddress })),
      abi: abi.totalSupply,
      chain: "bsc",
    })
  ).output.map(v => v.output);

  stakingPools.forEach((v, i) => {
    sdk.util.sumSingleBalance(
      balances,
      `bsc:${v.address}`,
      stakingPoolsBalances[i]
    );
  });

  return balances;
};

async function calculate(chainBlocks, localPools, remotePools) {
  const balances = {};

  const localPoolsBalances = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: localPools.map(v => ({ target: v.address, params: v.masterChefAddress })),
      abi: 'erc20:balanceOf',
      chain: "bsc",
    })
  ).output.map(v => v.output);

  const transformAddress = await transformBscAddress();

  const lpPositions = [];

  localPools.forEach((v, i) => {
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

  remotePools.forEach((v, i) => {
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
    transformAddress
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl,
    staking,
    masterchef: tvl,
  }
};
