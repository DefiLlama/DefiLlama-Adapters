const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { sumTokens2, } = require('../helper/unwrapLPs')

const stakingPool = ['0x488933457E89656D7eF7E69C10F2f80C7acA19b5', '0x4b1791422dE4807B2999Eeb65359F3E13fa9d11d'];
const bfcAddr = '0x0c7D5ae016f806603CB1782bEa29AC69471CAb9c';

const chainPools = {
  ethereum: {
    null: { pool: '0x13000c4a215efe7e414bb329b2f11c39bcf92d78', token: ADDRESSES.null, },
    usdt: { pool: '0x808c3ba97268dbf9695b1ec10729e09c7e67a9e3', token: ADDRESSES.ethereum.USDT },
    dai: { pool: '0xd76b7060f1b646fa14740ff6ac670a4f0a6fc5e3', token: ADDRESSES.ethereum.DAI },
    link: { pool: '0x25567603eb61a4a49f27e433652b5b8940d10682', token: ADDRESSES.ethereum.LINK },
    usdc: { pool: '0x128647690C7733593aA3Dd149EeBC5e256E79217', token: ADDRESSES.ethereum.USDC },
    wbtc: { pool: '0x93948Aa8488F522d5b079AF84fe411FBCE476e9f', token: ADDRESSES.ethereum.WBTC }
  },
  bsc: {
    null: { pool: '0x170b6AA872166eC2F8515c2B855C34B6C7563c18', token: ADDRESSES.null, },
    usdt: { pool: '0x2A29598cbc17BA112C8Fd0E07Fbf5402eF57E6b8', token: ADDRESSES.bsc.USDT },
    dai: { pool: '0xB67C5433d234d656002f12664d15ab4b40666D9B', token: ADDRESSES.bsc.DAI },
    eth: { pool: '0xf86d8218BCC15874f5D25c191FdDd43F2334c3EB', token: ADDRESSES.bsc.ETH },
    usdc: { pool: '0xBA9De5a8FD91408826616f2d6d7470A11E34c9F0', token: ADDRESSES.bsc.USDC },
    btcb: { pool: '0x26d0E4707af1c1DAAd8e9BA21b99cDa7Fd24c40B', token: ADDRESSES.bsc.BTCB },
    busd: { pool: '0x829ED2a2BeF8b72e648f92CBF01587C7E12e8c1e', token: ADDRESSES.bsc.BUSD }
  },
  avax: {
    null: { pool: '0x446881360d6d39779D292662fca9BC85C5789dB3', token: ADDRESSES.null, },
    eth: { pool: '0x8AbA88E8A4AB28319b782199cB17f0001EE67984', token: ADDRESSES.avax.WETH_e },
    usdt: { pool: '0xE893233515b7D02dD4e3D888162d4C87Dc837943', token: ADDRESSES.avax.USDT_e },
    usdc: { pool: '0x8385Ea36dD4BDC84B3F2ac718C332E18C1E42d36', token: ADDRESSES.avax.USDC_e },
    dai: { pool: '0x34DA42143b0c6E321CEb76931c637c12Bd865f7e', token: ADDRESSES.avax.DAI },
    wbtc: { pool: '0xc4D1e935F02A44D44985E6b1C0eE1ee616fC146a', token: ADDRESSES.avax.WBTC_e },
  },
  klaytn: {
    null: { pool: '0x829fCFb6A6EeA9d14eb4C14FaC5B29874BdBaD13', token: ADDRESSES.null, },
    keth: { pool: '0x07970F9D979D8594B394fE12345211C376aDfF89', token: ADDRESSES.klaytn.oETH },
    kusdt: { pool: '0xe0e67b991d6b5CF73d8A17A10c3DE74616C1ec11', token: ADDRESSES.klaytn.oUSDT },
    kdai: { pool: '0xE03487927e137526a2dB796A9B3b4048ab615043', token: ADDRESSES.klaytn.KDAI },
    usdc: { pool: '0x808c707c53c3D30d0247e4b8D78AA0D8b75CAAE1', token: ADDRESSES.klaytn.oUSDC },
    kwbtc: { pool: '0xa6aDE2e6c6F50a2d9b9C4b819e84b367F88C1598', token: ADDRESSES.klaytn.oWBTC },
    kxrp: { pool: '0x4800577A71F68eD7ef4C09cFBe7fd6E066D5F0dA', token: ADDRESSES.klaytn.oXRP },
  },
  bfc: {
    null: { pool: '0x4bAE7ba39E4e71660307dcE780f1Ec9b7B7666Ee', token: ADDRESSES.null, },
    UnifiedETH: { pool: '0xCbf6065954fC17d07b28102c84902F20FFaC0A33', token: ADDRESSES.bfc.UnifiedETH },
    UnifiedBNB: { pool: '0x942A9bF629d1E17D87294B0f20898eEb8316cDd6', token: ADDRESSES.bfc.UnifiedBNB },
    UnifiedUSDC: { pool: '0x168b2D7dd6b9812392f99bA01A14db03ED06dedc', token: ADDRESSES.bfc.UnifiedUSDC },
    UnifiedMATIC: { pool: '0xA1Bd1d501aF7d0B146951fDFF49BD4C0bD25e220', token: ADDRESSES.bfc.UnifiedMATIC },
    UnifiedUSDT: { pool: '0xeD7B0974dC5d98B9e7C83695C415d68b8781B0F8', token: ADDRESSES.bfc.UnifiedUSDT },
    UnifiedDAI: { pool: '0x2168dAb12A6A93181bbAD9C9dc769307C36fB45C', token: ADDRESSES.bfc.UnifiedDAI },
    UnifiedWBTC: { pool: '0xEa3b4a2dA5DbE8379AD4c60aaD5184df69D7C9AD', token: ADDRESSES.bfc.WBTC},
    UnifiedBTCB: { pool: '0x0B31FeE8bF53bFe2f5F7083B73A4c9C8B517E32F', token: ADDRESSES.bfc.BTCB},
    BitcoinUSD: { pool: '0xcF2FC1d354018A39D5Ef036aA865Ad8cbF7B611E', token: ADDRESSES.bfc.BitcoinUSD },
    WstBFC: { pool: '0xf9B2f6D2a61923E61aD9F6DAA78f52b7e1722b12', token: '0x386f2F5d9A97659C86f3cA9B8B11fc3F76eFDdaE' },
  },
}

Object.keys(chainPools).forEach(chain => {
  const pools = chainPools[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      return sumTokens2({ api, tokensAndOwners: Object.values(pools).map(({ pool, token }) => ([token, pool,])) })
    }
  }
})

module.exports.ethereum.staking = stakings(stakingPool, bfcAddr)
