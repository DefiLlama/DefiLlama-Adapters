const { uniTvlExport } = require('../helper/unknownTokens')

// BESCswap (Uniswap-style) factory & router on BESC Hyperchain
const FACTORY_ADDRESS = '0x20EE72D1B7E36e97566f31761dfF14eDc35Fbf22'
const ROUTER_ADDRESS  = '0x2600E57E2044d62277775A925709af0047c28Eb7'

module.exports = uniTvlExport('besc', FACTORY_ADDRESS)
