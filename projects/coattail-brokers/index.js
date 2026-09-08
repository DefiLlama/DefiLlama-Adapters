const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Coattail Brokers (Robinhood Chain). 1,776 Broker NFTs, each bound to an ERC-6551 wallet
// that holds Robinhood tokenized US stocks. The Booster ("payroll") buys the stocks the US
// Congress disclosed and credits them to the Broker wallets; The Floor is the basket router
// holders use to rebalance. TVL = the stock tokens (and USDG) sitting in those wallets, plus
// the stock credited by the Booster but not yet claimed into a wallet, plus the USDG fees
// accrued in The Floor. Positions live in per-NFT smart accounts, not in a shared vault.

const BROKER = '0x1122dB21998707F8c2eD8182734356C947fA5e98' // CoattailBroker ERC-721 (accountOf -> ERC-6551 wallet)
const BOOSTER = '0x7bAf435847A4b45c2e22a7fd13549C3192C95953' // payroll: holds distributed, unclaimed stock
const FLOOR = '0x478F22A32663cF37702d65352A7579A73e61FDc7' // BasketRouter ("The Floor"): accrues USDG fees
const SUPPLY = 1776 // fixed collection size, token ids 1..1776

// Every stock token The Floor can route (Uniswap v3 USDG pools with a Chainlink feed).
const STOCKS = [
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0x86923f96303D656E4aa86D9d42D1e57ad2023fdC', // AMD
  '0x12f190a9F9d7D37a250758b26824B97CE941bF54', // AMZN
  '0x6330D8C3178a418788dF01a47479c0ce7CCF450b', // COIN
  '0xdF0992E440dD0be65BD8439b609d6D4366bf1CB5', // CRCL
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0xe93237C50D904957Cf27E7B1133b510C669c2e74', // MSFT
  '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', // GOOGL
  '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', // META
  '0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A', // PLTR
  '0xb0992820E760d836549ba69BC7598b4af75dEE03', // ORCL
  '0xfF080c8ce2E5feadaCa0Da81314Ae59D232d4afD', // MU
  '0xc72b96e0E48ecd4DC75E1e45396e26300BC39681', // INTC
  '0x5f10A1C971B69e47e059e1dC91901B59b3fB49C3', // CRWV
  '0xB90A19fF0Af67f7779afF50A882A9CfF42446400', // SNDK
  '0xd917B029C761D264c6A312BBbcDA868658eF86a6', // USAR
  '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa', // SPCX
  '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68', // QQQ
  '0x92FD66527192E3e61d4DDd13322Aa222DE86F9B5', // SGOV
  '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f', // SLV
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0xa30FA36Db767ad9eD3f7a60fC79526fB4d56D344', // USO
  '0x1b0E319c6A659F002271B69dB8A7df2F911c153E', // GME
  '0x941AE714EC6D8130c7B75d67160Ca08f1e7d11Dd', // DELL
  '0x47F93d52cBeC7C6D2CfC080e154002370a60dAEA', // ASML
  '0xad25Ac6C84D497db898fa1E8387bf6Af3532a1c4', // BABA
  '0xec262a75e413fAfD0dF80480274532C79D42da09', // MSTR
  '0x58FfE4a942d3885bAa22D7520691F611EF09e7AA', // TSM
]

async function tvl(api) {
  const ids = Array.from({ length: SUPPLY }, (_, i) => i + 1)
  const wallets = await api.multiCall({
    target: BROKER,
    calls: ids,
    abi: 'function accountOf(uint256 tokenId) view returns (address)',
  })
  // Stocks the Booster has ever paid out, in case one is not (yet) routed on The Floor.
  const knownCount = await api.call({ target: BOOSTER, abi: 'uint256:knownTokenCount' })
  const known = await api.multiCall({
    target: BOOSTER,
    calls: Array.from({ length: +knownCount }, (_, i) => i),
    abi: 'function knownTokens(uint256) view returns (address)',
  })
  const tokens = [...new Set([...STOCKS, ...known, ADDRESSES.robinhood.USDG].map((t) => t.toLowerCase()))]
  return sumTokens2({ api, owners: [...wallets, BOOSTER, FLOOR], tokens })
}

module.exports = {
  methodology:
    'Sums the Robinhood tokenized stocks (and USDG) held by the 1,776 Broker ERC-6551 wallets, the stock credited by the Booster payroll contract but not yet claimed into a wallet, and the USDG fees accrued in The Floor basket router. The COAT token is not counted.',
  start: 1787011200, // 2026-08-18, mainnet deployment
  robinhood: { tvl },
}
