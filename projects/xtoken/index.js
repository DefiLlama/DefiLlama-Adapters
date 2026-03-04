const ADDRESSES = require('../helper/coreAssets.json')

const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const ABI = {
  getFundHoldings: 'uint256:getFundHoldings',
  getNav: 'uint256:getNav',
  totalAllocatedNav: 'uint256:totalAllocatedNav',
  getBufferBalance: 'uint256:getBufferBalance',
  getRewardsContributionToNav: 'uint256:getRewardsContributionToNav',
  getFundKncBalanceTwei: 'uint256:getFundKncBalanceTwei',
  debtBalanceOf: 'function debtBalanceOf(address account, bytes32 currencyKey) view returns (uint256)',
  getEthBalance: 'uint256:getEthBalance',
  getSnxBalance: 'uint256:getSnxBalance',
}

const {
  kncAddr,
  xaaveaAddr,
  xaavebAddr,
  xalphaaAddr,
  alphaAddr,
  xbntaAddr,
  bntAddr,
  xinchaAddr,
  xinchbAddr,
  xkncaAddr,
  xkncbAddr,
  xsnxaAdminAddr,
  xsnxaTradeAccountingAddr,
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
  ethrsi6040Addr,
  snxAddr,
  wethAddr,
  snxTokenAddr,
  inchAddr,
  usdcAddr,
  aaveAddr,
} = require('./constants')

const CONFIG = {
  ethereum: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 14373342 },
  arbitrum: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 7804500 },
  optimism: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 4396677 },
  polygon: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 25871314 },
}

const DEPLOYED_POOL_EVENT = 'event DeployedIncentivizedPool (address indexed clrInstance, address indexed token0, address indexed token1, uint24 fee, int24 lowerTick, int24 upperTick)'

const XU3_LPS = [xu3lpaAddr, xu3lpbAddr, xu3lpfAddr, xu3lpgAddr, xu3lphAddr]

const SUSD_CURRENCY_KEY = '0x7355534400000000000000000000000000000000000000000000000000000000'

const toNum = (v) => Number(v ?? 0)
const sumArr = (arr) => arr.reduce((acc, v) => acc + toNum(v), 0)

async function sumMultiCall(api, { abi, calls, scale = 1 }) {
  if (!calls?.length) return 0
  const res = await api.multiCall({ abi, calls })
  return sumArr(res) / scale
}

function addToken(api, token, amount) {
  const v = toNum(amount)
  if (v) api.add(token, v)
}

async function runMultiCallAdds(api, actions) {
  for (const action of actions) {
    const amount = await sumMultiCall(api, action)
    addToken(api, action.token, amount)
  }
}

async function ethTvl(api) {
  const aaveBals = await api.multiCall({ abi: ABI.getFundHoldings, calls: [xaaveaAddr, xaavebAddr] })
  api.addTokens(aaveAddr, aaveBals)

  await runMultiCallAdds(api, [
    { token: usdcAddr, abi: ABI.getNav, calls: XU3_LPS, scale: 1e12 },
    { token: inchAddr, abi: ABI.getNav, calls: [xinchaAddr, xinchbAddr] },
    { token: alphaAddr, abi: ABI.getNav, calls: [xalphaaAddr] },

    { token: bntAddr, abi: ABI.totalAllocatedNav, calls: [xbntaAddr] },
    { token: bntAddr, abi: ABI.getBufferBalance, calls: [xbntaAddr] },
    { token: bntAddr, abi: ABI.getRewardsContributionToNav, calls: [xbntaAddr] },

    { token: kncAddr, abi: ABI.getFundKncBalanceTwei, calls: [xkncaAddr, xkncbAddr] },

    { token: snxTokenAddr, abi: ABI.getSnxBalance, calls: [xsnxaTradeAccountingAddr] },
    { token: wethAddr, abi: ABI.getEthBalance, calls: [xsnxaTradeAccountingAddr] },
  ])

  await api.sumTokens({ tokensAndOwners: [[ethrsi6040Addr, xsnxaAdminAddr]] })

  const xsnxaSusd = await api.call({ abi: ABI.debtBalanceOf, target: snxAddr, params: [xsnxaAdminAddr, SUSD_CURRENCY_KEY] })
  addToken(api, ADDRESSES.ethereum.sUSD, xsnxaSusd)
}

async function baseTvl(api, chain, { factory, fromBlock }) {
  const logs = await getLogs({ api, target: factory, eventAbi: DEPLOYED_POOL_EVENT, onlyArgs: true, fromBlock })
  await api.sumTokens({ ownerTokens: logs.map(({ token0, token1, clrInstance }) => [[token0, token1], clrInstance]) })
  if (chain === 'ethereum') await ethTvl(api)
  return sumTokens2({ api, owners: logs.map((l) => l.clrInstance), resolveUniV3: true })
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: `TVL includes deposits made to xToken Terminal and xToken Market.`,
}

for (const chain of Object.keys(CONFIG)) {
  module.exports[chain] = {
    tvl: (api) => baseTvl(api, chain, CONFIG[chain]),
  }
}

