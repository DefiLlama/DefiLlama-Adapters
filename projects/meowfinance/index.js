const abi = require("./abi.json");
const { pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const meow = "0x41F4CC9613E31d4E77C428b40D53537Da24264Ee";
const meowMining = "0xba1a3dACa919616aA462E93A80EFbe82753f9087";
const meowFtm = "0x150Aeb5389d56E258c2bbb42c7e67e944EDEE913";

const workers = [
  "0x5f1D549826e1AE30D653aD17e7277Fb7C6AC7EDD", // SpiritswapWorker_USDC_FTM_Spirit_Worker
  "0x9719F0e303db3aA8F04199b74654925516a6E9d5", // SpiritswapWorker_fUSDT_FTM_Spirit_Worker
  "0x0aE50E933491Cc541840f3c4982fd290885abfb6", // SpookyswapWorker_BNB_FTM_Spooky_Worker
  "0x5a1F2E391873ef63F727fEA1eDe8E4F6cf98b386", // SpookyswapWorker_BOO_FTM_Spooky_Worker
  "0x585AC8672F43f81f3e39c2E22680F071eBbB6838", // SpookyswapWorker_BTC_FTM_Spooky_Worker
  "0x3AE6751A57b5e72E52451E8C51E5f7F295B419Bc", // SpookyswapWorker_DAI_FTM_Spooky_Worker
  "0xa5FA401ad612246fD57337472254E339fE02d3Be", // SpookyswapWorker_ETH_FTM_Spooky_Worker
  "0x2e66442814bb4555276614E6C62d1cc3AF64a721", // SpookyswapWorker_LINK_FTM_Spooky_Worker
  "0xAd93a6f25a9e50ee7DeaA270f50418EBC57dA021", // SpookyswapWorker_SUSHI_FTM_Spooky_Worker
  "0x42289105e0271535AB631098e0cfC358c01E7c18", // SpookyswapWorker_USDC_FTM_Spooky_Worker
  "0x498bfdF61Ab7ca100E246DB0bEd893600329e957", // SpookyswapWorker_WFTM_BOO_Spooky_Worker
  "0xEa61Ecd00dd603bA6C69E4B4323310285966F450", // SpookyswapWorker_WFTM_BTC_Spooky_Worker
  "0x4293F2f8B6817633D92b6FCA585Da42d856BFfA4", // SpookyswapWorker_WFTM_DAI_Spooky_Worker
  "0x6F2E8565335dDaC37AAc62a855e452D17ee98038", // SpookyswapWorker_WFTM_ETH_Spooky_Worker
  "0xfB1d7b5Bf5E59bF158553cdEbf8CF892BD3Ec503", // SpookyswapWorker_WFTM_USDC_Spooky_Worker
  "0xF7C0B655C7C676A715c5CEfa39A887779B2ab2b0", // SpookyswapWorker_WFTM_fUSDT_Spooky_Worker
  "0xC14f48826EB564201Bf7D7111f0b46e2301bF36A", // SpookyswapWorker_fUSDT_FTM_Spooky_Worker
];

async function calcTvl(api, borrow) {
  if (borrow) return {}
  const poolInfos = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: meowMining})
  return api.sumTokens({ owner: meowMining, tokens: poolInfos.map(p => p.stakeToken), blacklistedTokens: [meowFtm] })
}

async function tvl(api) {
  await calcTvl(api, false);
  const lpTokens = await api.multiCall({  abi: abi.lpToken, calls: workers})
  const shares = await api.multiCall({  abi: 'uint256:totalShare', calls: workers})
  const bals  = (await api.multiCall({  abi: 'function shareToBalance(uint256) view returns (uint256)', calls: lpTokens.map((lp, i) => ({ target: lp, params: shares[i] })), permitFailure: true})).map(b => b || 0)
  api.add(lpTokens, bals)
}

async function borrowed(api) {
  return await calcTvl(api, true);
}

module.exports = {
  fantom: {
    tvl,
    borrowed,
    pool2: pool2(meowMining, [meowFtm],),
    staking: staking(meowMining, meow,),
  },
};
