// const {zProtocolScrollFarmingExports} = require("./scroll");
const { staking, } = require('../helper/unknownTokens');
const { sumTokens2 } = require('../helper/unwrapLPs');

const FACTORY = "0xED93e976d43AF67Cc05aa9f6Ab3D2234358F0C81";
const FARM_MASTER = "0x7a757614fEFA05f40456016Af74262Fe53546DBa";
const ZP_TOKEN = "0x2147a89fb4608752807216D5070471c09A0DcE32";
// const export1 = zProtocolScrollFarmingExports(FARM_MASTER, FACTORY, 'scroll', ZP_TOKEN);
const farmAbi = {
  poolInfo: "function poolInfo(uint256) view returns (address token, uint256 catId, uint256 allocPoint, uint256 lastRewardTime, uint256 accZPPerShare, uint256 depositFeeBP, uint256 harvestInterval)",
}

module.exports = {
  methodology: "count value of staked tokens except of z-dex LP tokens",
  misrepresentedTokens: true,
  scroll: {
    tvl,
    staking: staking({ tokens: [ZP_TOKEN], owner: FARM_MASTER, useDefaultCoreAssets: true, lps: ['0xb74806780Ac59D0d7567bE66Ff23511400bD9cf8']})
  }
}

async function tvl(api) {
  let blacklistedTokens = await api.fetchList({  lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: FACTORY })
  blacklistedTokens.push(ZP_TOKEN)  
  const poolInfo = await api.fetchList({  lengthAbi: 'poolsLength', itemAbi: farmAbi.poolInfo, target: FARM_MASTER })
  await sumTokens2({ api, owner: FARM_MASTER, tokens: poolInfo.map(pool => pool.token), resolveLP: true, blacklistedTokens, })
  api.removeTokenBalance(ZP_TOKEN)
}