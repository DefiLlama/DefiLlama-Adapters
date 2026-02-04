const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC = ADDRESSES.arbitrum.USDC_CIRCLE
const USDX = '0xEE43369197F78CFDF0D8fc48D296964C50AC7B57'
const liquidityPool = '0x20F6c269ACe844120de7AB84EeaD8359688670Bc'
const USDT = ADDRESSES.arbitrum.USDT
const USDCe = ADDRESSES.arbitrum.USDC
const DAI = ADDRESSES.optimism.DAI

// zetaChain
const USDC_zeta = ADDRESSES.zeta.USDC
const USDT_zeta = ADDRESSES.zeta.USDT_1
const dai_zeta = ADDRESSES.zeta.USDC_1
const usdce_zeta = ADDRESSES.zeta.USDT
const USDX_zeta = '0x64663c58D42BA8b5Bb79aD924621e5742e2232D8'

module.exports = {
  arbitrum: { tvl: sumTokensExport({ owner: USDX, tokens: [USDC, USDT, USDCe, DAI], }), },
  zeta: { tvl: sumTokensExport({ owner: USDX_zeta, tokens: [USDC_zeta, USDT_zeta, dai_zeta, usdce_zeta], }),},
  methodology: `The TVL of SubstanceX is equal to the total value of underlying assets locked in the USDX contract.`,
};
