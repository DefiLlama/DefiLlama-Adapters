const { compoundExports } = require('../helper/compound')
const { lendingMarket } = require('../helper/methodologies')
const { staking } = require("../helper/staking");

module.exports = {
  polygon: compoundExports('0x1eDf64B621F17dc45c82a65E1312E8df988A94D3', 'polygon'),
  xdc: compoundExports('0x301C76e7b60e9824E32991B8F29e1c4a03B4F65b', 'xdc'),
  linea: compoundExports('0x301C76e7b60e9824E32991B8F29e1c4a03B4F65b', 'linea'),
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses.`,
}

module.exports.polygon.staking = staking("0xC1704c99278c3e5A91AfB117301eA61B003Aa650",  "0xfFA188493C15DfAf2C206c97D8633377847b6a52",)
