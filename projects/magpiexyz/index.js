const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const WombatPoolHelperAbi = require("./abis/wombatPoolHelper.json")
const MasterMagpieAbi = require("./abis/masterMagpie.json");
const MasterMagpieAddress = "0xa3B615667CBd33cfc69843Bf11Fbb2A1D926BD46"
const VlMGPAddress = "0x9B69b06272980FA6BAd9D88680a71e3c3BeB32c6"
const MGPAddress = "0xD06716E1Ff2E492Cc5034c2E81805562dd3b45fa"
const WOMAddress = "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1"
const MWOMAddress = "0x027a9d301FB747cd972CFB29A63f3BDA551DFc5c"
const MgpLpAxlUsdAddress = "0x4e33Ee8675a7ef1bd9B1cd35338AdFb7bdEd74A9"

async function getPoolList(api) {
  let poolTokens = await api.fetchList({ lengthAbi: MasterMagpieAbi.poolLength, itemAbi: MasterMagpieAbi.registeredToken, target: MasterMagpieAddress })
  const customPools = new Set([MWOMAddress, VlMGPAddress])
  poolTokens = poolTokens.filter(i => !customPools.has(i))
  const infos = await api.multiCall({ calls: poolTokens, abi: MasterMagpieAbi.tokenToPoolInfo, target: MasterMagpieAddress })
  const depositTokens = await api.multiCall({ calls: infos.map(i => i.helper), abi: WombatPoolHelperAbi.depositToken, })
  return [poolTokens, depositTokens]
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const [poolTokens, depositTokens] = await getPoolList(api);
  const balances = {};
  const womBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MasterMagpieAddress })
  sdk.util.sumSingleBalance(balances, WOMAddress, womBal, api.chain)
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: poolTokens.map(i => ({ target: i, params: MasterMagpieAddress })) })
  bals.forEach((v, i) => {
    if (poolTokens[i].toLowerCase() == MgpLpAxlUsdAddress.toLowerCase()) v /= 1e12
    sdk.util.sumSingleBalance(balances, depositTokens[i], v, api.chain)
  })
  return balances
}

module.exports = {
  bsc: {
    tvl,
    staking: staking(VlMGPAddress, MGPAddress)
  }
}; 