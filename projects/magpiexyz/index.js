const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const WombatPoolHelperAbi = require("./abis/wombatPoolHelper.json")
const MasterMagpieAbi = require("./abis/masterMagpie.json");
const config = require("./config");

const MgpLpAxlUsdAddress = "0x4e33Ee8675a7ef1bd9B1cd35338AdFb7bdEd74A9"
const UsdtLpOnArbitrum = "0xF563200Ff355661Bac6f190EfB6CF97831776F0f"
const UsdcLpOnArbitrum = "0x72aA7a1b3fB43e6c3C83DC31DA0d4099B475A47A"

async function getPoolList(api, MasterMagpieAddress, VlMGPAddress, MWOMAddress, MWOMSVAddress) {
  let poolTokens = await api.fetchList({ lengthAbi: MasterMagpieAbi.poolLength, itemAbi: MasterMagpieAbi.registeredToken, target: MasterMagpieAddress })
  const customPools = new Set([MWOMAddress, VlMGPAddress, MWOMSVAddress])
  poolTokens = poolTokens.filter(i => !customPools.has(i))
  const infos = await api.multiCall({ calls: poolTokens, abi: MasterMagpieAbi.tokenToPoolInfo, target: MasterMagpieAddress })
  const depositTokens = await api.multiCall({ calls: infos.map(i => i.helper), abi: WombatPoolHelperAbi.depositToken, })
  return [poolTokens, depositTokens]
}

async function tvl(MasterMagpieAddress, VlMGPAddress, WOMAddress, MWOMAddress, MWOMSVAddress, MGPAddress, timestamp, block, chainBlocks, { api }) {
  const [poolTokens, depositTokens] = await getPoolList(api, MasterMagpieAddress, VlMGPAddress, MWOMAddress, MWOMSVAddress);
  const balances = {};
  const womBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MasterMagpieAddress })
  sdk.util.sumSingleBalance(balances, WOMAddress, womBal, api.chain)
  if(MWOMSVAddress != "0x0000000000000000000000000000000000000000") {
    const mWomSVBal = await api.call({ abi: 'erc20:balanceOf', target: MWOMAddress, params: MWOMSVAddress })
    sdk.util.sumSingleBalance(balances, WOMAddress, mWomSVBal, api.chain)
  }
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: poolTokens.map(i => ({ target: i, params: MasterMagpieAddress })) })
  bals.forEach((v, i) => {
    if (
      poolTokens[i].toLowerCase() == MgpLpAxlUsdAddress.toLowerCase() ||
      poolTokens[i].toLowerCase() == UsdtLpOnArbitrum.toLowerCase() ||
      poolTokens[i].toLowerCase() == UsdcLpOnArbitrum.toLowerCase()
    ) v /= 1e12
    sdk.util.sumSingleBalance(balances, depositTokens[i], v, api.chain)
  })
  return balances
}

Object.keys(config).forEach((chain) => {
  const { MasterMagpieAddress, VlMGPAddress, MWOMSVAddress, MGPAddress, WOMAddress, MWOMAddress } = config[chain];
  module.exports[chain] = {
      tvl: tvl.bind(null, MasterMagpieAddress, VlMGPAddress, WOMAddress, MWOMAddress, MWOMSVAddress, MGPAddress),
      staking: staking(VlMGPAddress, MGPAddress)
  }
})