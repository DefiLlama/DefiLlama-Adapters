const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs')

const pools = {
  owner: '0x690BBaa9EDBb762542FD198763092eaB2B2A5350',
  tokens: [
    ADDRESSES.polygon.USDT,  // USDT
    ADDRESSES.polygon.USDC,  // USDC
    ADDRESSES.polygon.DAI, // DAI
  ]
}
module.exports = {
  doublecounted: true,
  polygon: {
    tvl: sumTokensExport(pools)
  },
  methodology: "Counts DAI, USDC, & USDT tokens on the 3MM Base Pool for tvl"
};
