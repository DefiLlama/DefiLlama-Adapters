const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getConfig } = require('../helper/cache')
const abi = require("./abi.json");

const url = 'https://api.marsecosystem.com/api/pools';

async function tvl(timestamp, chainBlocks) {
  const rows = (await getConfig('mars-ecosystem', url));
  const localPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster') && !v.baseToken.includes('xms'));
  const remotePools = rows.filter(v => v.masterChef.includes('MarsFarmV2') && !v.baseToken.includes('xms'));
  return await calculate(chainBlocks, localPools, remotePools);
}
async function staking(timstamp, chainBlocks) {
  const rows = (await getConfig('mars-ecosystem', url));
  const localPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster') && v.baseToken.includes('xms'));
  const remotePools = rows.filter(v => v.masterChef.includes('MarsFarmV2') && v.baseToken.includes('xms'));
  return await calculate(chainBlocks, localPools, remotePools);
}

async function calculate(chainBlocks, localPools, remotePools) {
  let balances = {};

  const localPoolsBalances = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: localPools.map(v => ({ target: v.address, params: v.masterChefAddress })),
      abi: 'erc20:balanceOf',
      chain: "bsc",
    })
  ).output.map(v => v.output);

  const transformAdress = i => `bsc:${i}`;

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
    tvl,
    staking,
  }
};
