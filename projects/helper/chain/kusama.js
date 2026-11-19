// KSM balances: relay chain + Asset Hub, same sources and fallbacks as the polkadot helper
const { makeHelper } = require('./polkadot')

module.exports = makeHelper('kusama')
