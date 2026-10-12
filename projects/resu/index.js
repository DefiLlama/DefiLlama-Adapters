const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/chain/ton')
const VAULTS = {
  base: [
    '0x80669f196620597AC5740416CB85754761Ccb786', // MSFT
    '0xb555F9D5eF631868cF070Fe3466765E26502693A', // NVDA
  ],
  arbitrum: [
    '0x8a8CB825f4CCd2e93604e828f62C3ce3f5C8F464', // WETH
  ],
  hyperliquid: [
    '0x53F7e94a0edd3CFb958332842ec1fEce566f941d', // HLP
  ],
  monad: [
    '0x804E56c448A14611ECAC4cf07a222878820e3876', // aprMON
  ],
  robinhood: [
    '0x5285F357Eb16E6fd40ba73fCA4F37776A3A5d129', // SPY
  ],
}

const navTvl = (vaults) => async (api) => {
  const navs = await api.multiCall({ abi: 'uint256:nav', calls: vaults })
  navs.forEach((nav) => api.addUSDValue(Number(nav) / 1e18))
}

module.exports = {
  methodology:
    'TVL is the net asset value locked in each Resu pool. On EVM chains the ' +
    "pool's OracleVault.nav() returns its value in USD (read from Chainlink / " +
    'HyperCore oracles); on TON it is the base jetton (tsTON, tsUSDe) held by ' +
    'each pool. Solana is live on devnet only and is excluded.',
  base: { tvl: navTvl(VAULTS.base) },
  arbitrum: { tvl: navTvl(VAULTS.arbitrum) },
  hyperliquid: { tvl: navTvl(VAULTS.hyperliquid) },
  monad: { tvl: navTvl(VAULTS.monad) },
  robinhood: { tvl: navTvl(VAULTS.robinhood) },
  ton: {
    tvl: sumTokensExport({
      owners: [
        'EQCYM6Xhwy-xbfzJtkUrKVjPH2iSjJzkyeq2l9lWFXaqOMTa', // tsTON pool
        'EQC-EijLoFEAy-pMuvxjlRtQ4yqmKO62ZnptY0J3VvAgVwdE', // tsUSDe pool
      ],
      tokens: [ADDRESSES.ton.tsTON, ADDRESSES.ton.tsUSDe],
    }),
  },
}
