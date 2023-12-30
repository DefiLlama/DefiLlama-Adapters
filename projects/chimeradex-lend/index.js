const { compoundExports2 } = require('../helper/compound')

const config = {
	scroll: '0x05C7A68321a43C9FB3eaC6D8E852831a48C4B273',
	arbitrum: '0xBDa8C17aa00854f401057ec7d796577a8ae96aDE'
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain]})
})
