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

const navTvl = async (api) => {
  const vaults = VAULTS[api.chain] || []
  const navs = await api.multiCall({ abi: 'uint256:nav', calls: vaults, permitFailure: true, excludeFailed: true, })
  navs.forEach((nav) => api.addUSDValue(Number(nav) / 1e18))
}

module.exports = {
  methodology:
    'TVL is the net asset value locked in each Resu pool',
  base: { tvl: navTvl },
  arbitrum: { tvl: navTvl },
  hyperliquid: { tvl: navTvl },
  monad: { tvl: navTvl },
  robinhood: { tvl: navTvl },
  ton: {
    tvl: sumTokensExport({
      owners: [
        'EQCYM6Xhwy-xbfzJtkUrKVjPH2iSjJzkyeq2l9lWFXaqOMTa', // tsTON pool
        'EQC-EijLoFEAy-pMuvxjlRtQ4yqmKO62ZnptY0J3VvAgVwdE', // tsUSDe pool
      ],
      tokens: [ADDRESSES.ton.tsTON, ADDRESSES.ton.tsUSDe],
      onlyWhitelistedTokens: true,
    }),
  },
}
