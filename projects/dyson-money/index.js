const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');


const TVL_URL = 'https://api2.dyson.money/vaults/metrics/tvl';

const sphere_token = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7"
const ylSPHEREvault = "0x4Af613f297ab00361D516454E5E46bc895889653"


module.exports = {
  doublecounted: true,
  methodology: "Counts the tokens locked in the contracts.",
};

const config = {
  polygon: {
    owners: [ylSPHEREvault],
    tokens: [
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.WETH_1,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WBTC,
      "0x172370d5Cd63279eFa6d502DAB29171933a610AF"
    ],
    staking: staking(ylSPHEREvault, sphere_token),
  },
  optimism: {},
  arbitrum: {
    blacklistedVaults: [
      '0x5e14aa6dd1606e789be9de8ded0b78b36d1fa4a3',
      '0x3b443e9b9b7f340c7b1417abfdc64132341873d4',
    ]
  },
  bsc: { key: 'binance' },
  avax: { key: 'avalanche',
    blacklistedVaults: ['0xe5b584f5f8b2872202433d56299e3867ba246c6e', '0xe98786b94520772dd9efcc670d72939e184a6198'],
   },
  kava: {
    blacklistedVaults: ['0x489e54eec6c228a1457975eb150a7efb8350b5be'],
  },
  base: {},
}

Object.keys(config).forEach(chain => {
  let { key, owners, tokens, staking, blacklistedVaults  = []} = config[chain]
  blacklistedVaults = new Set(blacklistedVaults.map(i => i.toLowerCase()))


  module.exports[chain] = {
    tvl: async (api) => {
      if (owners && tokens) await api.sumTokens({ owners, tokens, })
      const config = await getConfig('dyson-money/api2', 'https://api2.dyson.money/vaults')
      const chainConfig = key ? config[key] : config[chain]
      let vaultsAll = Object.values(chainConfig ?? {}).map(i => i.address).filter(i => !blacklistedVaults.has(i.toLowerCase()))
      let vaults1 = []
      let vaults2 = []

      const isVault1 = await api.multiCall({ abi: 'address:want', calls: vaultsAll, permitFailure: true })
      isVault1.forEach((v, i) => {
        if (v) vaults1.push(vaultsAll[i])
        else vaults2.push(vaultsAll[i])
      });

      const token = await api.multiCall({ abi: 'address:want', calls: vaults1 })
      const balance = await api.multiCall({ abi: 'uint256:balance', calls: vaults1 })
      const token2 = await api.multiCall({ abi: 'address:underlying', calls: vaults2 })
      const balance2 = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: vaults2 })
      api.add(token, balance)
      api.add(token2, balance2)
      return sumTokens2({ api, resolveLP: true, })
    }
  }
  if (staking) module.exports[chain].staking = staking
})