const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC = ADDRESSES.arbitrum.USDC_CIRCLE
const USDX = '0xEE43369197F78CFDF0D8fc48D296964C50AC7B57'
const liquidityPool = '0x20F6c269ACe844120de7AB84EeaD8359688670Bc'
const USDT = ADDRESSES.arbitrum.USDT
const USDCe = ADDRESSES.arbitrum.USDC
const DAI = ADDRESSES.optimism.DAI

module.exports = {
  arbitrum: { tvl: sumTokensExport({ owner: USDX, tokens: [USDC, USDT, USDCe, DAI], }), },
  methodology: `The TVL of SubstanceX is equal to the total value of underlying assets locked in the USDX contract.`,
};
