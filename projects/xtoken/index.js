const ADDRESSES = require('../helper/coreAssets.json');
const abi = require("./abi.json");
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
  xu3lpcAddr,
  xu3lpdAddr,
  xu3lpeAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
  ethrsi6040Addr,
  snxAddr,
  wbtcAddr,
  wethAddr,
  snxTokenAddr,
  inchAddr,
  usdcAddr,
  aaveAddr,
} = require("./constants");
const xu3lps = [
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpcAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
];
const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function ethTvl(api) {
  const aaveBals = await api.multiCall({ abi: abi.getFundHoldings, calls: [xaaveaAddr, xaavebAddr] })
  const xu3lpsBals = (await api.multiCall({ abi: abi.getNav, calls: xu3lps })).reduce((acc, curr) => acc + +curr / 1e12, 0)
  const xu3lpsdBals = (await api.multiCall({ abi: abi.getNav, calls: [xu3lpdAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xu3lpsedBals = (await api.multiCall({ abi: abi.getNav, calls: [xu3lpeAddr] })).reduce((acc, curr) => acc + +curr / 1e10, 0)
  const xinchTvlRaw = (await api.multiCall({ abi: abi.getNav, calls: [xinchaAddr, xinchbAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xalphaaTvlRaw = (await api.multiCall({ abi: abi.getNav, calls: [xalphaaAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xbntaStakedRaw = (await api.multiCall({ abi: abi.totalAllocatedNav, calls: [xbntaAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xbntaBufferRaw = (await api.multiCall({ abi: abi.getBufferBalance, calls: [xbntaAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xbntaPendingRaw = (await api.multiCall({ abi: abi.getRewardsContributionToNav, calls: [xbntaAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xkncTvlRaw = (await api.multiCall({ abi: abi.getFundKncBalanceTwei, calls: [xkncaAddr, xkncbAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xsnxaSnxRaw = (await api.multiCall({ abi: abi.getSnxBalance, calls: [xsnxaTradeAccountingAddr] })).reduce((acc, curr) => acc + +curr, 0)
  const xsnxaEthRaw = (await api.multiCall({ abi: abi.getEthBalance, calls: [xsnxaTradeAccountingAddr] })).reduce((acc, curr) => acc + +curr, 0)
  api.addTokens(aaveAddr, aaveBals)
  api.addTokens(usdcAddr, xu3lpsBals)
  api.addTokens(wethAddr, xu3lpsdBals)
  api.addTokens(wbtcAddr, xu3lpsedBals)
  api.addTokens(inchAddr, xinchTvlRaw)
  api.addTokens(bntAddr, xbntaStakedRaw)
  api.addTokens(bntAddr, xbntaBufferRaw)
  api.addTokens(bntAddr, xbntaPendingRaw)
  api.addTokens(kncAddr, xkncTvlRaw)
  api.addTokens(alphaAddr, xalphaaTvlRaw)
  api.addTokens(snxTokenAddr, xsnxaSnxRaw)
  api.addTokens(wethAddr, xsnxaEthRaw)

  await api.sumTokens({ tokensAndOwners: [[ethrsi6040Addr, xsnxaAdminAddr]] })
  const xsnxaSusdRaw = (await api.call({ abi: abi.debtBalanceOf, target: snxAddr, params: [xsnxaAdminAddr, '0x7355534400000000000000000000000000000000000000000000000000000000'], }));
  api.add(ADDRESSES.ethereum.sUSD, xsnxaSusdRaw)
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: `TVL includes deposits made to xToken Terminal and xToken Market.`,
};

const config = {
  ethereum: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 14373342 },
  arbitrum: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 7804500 },
  optimism: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 4396677 },
  polygon: { factory: '0x090559D58aAB8828C27eE7a7EAb18efD5bB90374', fromBlock: 25871314 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event DeployedIncentivizedPool (address indexed clrInstance, address indexed token0, address indexed token1, uint24 fee, int24 lowerTick, int24 upperTick)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(log => [[log.token0, log.token1], log.clrInstance])
      await api.sumTokens({ ownerTokens })
      if (chain === 'ethereum') await ethTvl(api)
      return sumTokens2({ api, owners: logs.map(log => log.clrInstance), resolveUniV3: true, })
    }
  }
})
