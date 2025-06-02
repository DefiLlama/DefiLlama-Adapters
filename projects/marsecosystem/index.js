
const sdk = require('@defillama/sdk')
const { unwrapUniswapLPs, } = require("../helper/unwrapLPs");
const { getConfig } = require('../helper/cache')
const abi = require("./abi.json");
const { getUniTVL } = require("../helper/unknownTokens");

const url = 'https://api.marsecosystem.com/api/pools';

async function tvl(api) {
  const rows = (await getConfig('mars-ecosystem', url));
  const localPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster') && !v.baseToken.includes('xms'));
  const remotePools = rows.filter(v => v.masterChef.includes('MarsFarmV2') && !v.baseToken.includes('xms'));
  return await calculate(api, localPools, remotePools);
}
async function staking(api) {
  const rows = (await getConfig('mars-ecosystem', url));
  const localPools = rows.filter(v => v.masterChef.includes('LiquidityMiningMaster') && v.baseToken.includes('xms'));
  const remotePools = rows.filter(v => v.masterChef.includes('MarsFarmV2') && v.baseToken.includes('xms'));
  return await calculate(api, localPools, remotePools);
}

async function calculate(api, localPools, remotePools) {
  const localPoolsBalances = await api.multiCall({
    calls: localPools.map(v => ({ target: v.address, params: v.masterChefAddress })),
    abi: 'erc20:balanceOf',
  })


  const lpPositions = [];

  localPools.map((v, i) => {
    if (v.baseToken == v.quoteToken) {
      api.add(v.address, localPoolsBalances[i]);
    } else {
      // lpPositions.push({ token: v.address, balance: localPoolsBalances[i] });  // already counted as part of dex
    }
  });

  const remotePoolsBalances = await api.multiCall({
    calls: remotePools.map(v => ({ target: v.masterChefAddress, params: [v.pid] })),
    abi: abi.sharesTotal,
  })

  remotePools.map((v, i) => {
    if (v.baseToken == v.quoteToken) {
      api.add(v.address, remotePoolsBalances[i]);
    } else {
      // lpPositions.push({ token: v.address, balance: remotePoolsBalances[i] });  // already counted as part of dex
    }
  });

  api.removeTokenBalance('0xBb0fA2fBE9b37444f5D1dBD22e0e5bdD2afbbE85')  // project related token
  await unwrapUniswapLPs(api.getBalances(), lpPositions, api.block, api.chain);
  return api.getBalances();
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([getUniTVL({ factory: '0x6f12482D9869303B998C54D91bCD8bCcba81f3bE', useDefaultCoreAssets: true, }), tvl]),
    staking,
  }
};
