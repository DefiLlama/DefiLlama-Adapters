const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const WombatPoolHelperAbi = require("./abis/wombatPoolHelper.json")
const MasterMagpieAbi = require("./abis/masterMagpie.json");
const config = require("./config")

async function getPoolList(api, MasterMagpieAddress, VlMGPAddress, MWOMAddress, MWOMSVAddress) {
  let poolTokens = await api.fetchList({ lengthAbi: MasterMagpieAbi.poolLength, itemAbi: MasterMagpieAbi.registeredToken, target: MasterMagpieAddress })
  const customPools = new Set([MWOMAddress, VlMGPAddress, MWOMSVAddress, '0x2130Df9dba40AfeFcA4C9b145f5ed095335c5FA3'].map(i => i.toLowerCase()))
  poolTokens = poolTokens.filter(i => !customPools.has(i.toLowerCase()))
  const infos = await api.multiCall({ calls: poolTokens, abi: MasterMagpieAbi.tokenToPoolInfo, target: MasterMagpieAddress })
  const depositTokens = await api.multiCall({ calls: infos.map(i => i.helper), abi: WombatPoolHelperAbi.depositToken, })
  return [poolTokens, depositTokens]
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const { MasterMagpieAddress, VlMGPAddress, MWOMSVAddress, WOMAddress, MWOMAddress } = config[api.chain];
  const [poolTokens, depositTokens] = await getPoolList(api, MasterMagpieAddress, VlMGPAddress, MWOMAddress, MWOMSVAddress);
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: depositTokens })
  const balances = {};
  const womBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MasterMagpieAddress })
  sdk.util.sumSingleBalance(balances, WOMAddress, womBal, api.chain)
  if (MWOMSVAddress != ADDRESSES.null) {
    const mWomSVBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MWOMSVAddress })
    sdk.util.sumSingleBalance(balances, WOMAddress, mWomSVBal, api.chain)
  }
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: poolTokens.map(i => ({ target: i, params: MasterMagpieAddress })) })
  bals.forEach((v, i) => {
    v /= 10 ** (18 - decimals[i])
    sdk.util.sumSingleBalance(balances, depositTokens[i], v, api.chain)
  })
  return balances
}

Object.keys(config).forEach((chain) => {
  const { VlMGPAddress, MGPAddress, } = config[chain];
  module.exports[chain] = {
    tvl: tvl,
    staking: staking(VlMGPAddress, MGPAddress)
  }
})