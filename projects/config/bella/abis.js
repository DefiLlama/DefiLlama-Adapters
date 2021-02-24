let abis = {}

const { mini } = require('./abis/mini.js')
const { erc20 } = require('./abis/erc20.js')
const { bLocker } = require('./abis/bLocker.js')
const { bStaking } = require('./abis/bStaking.js')
const { bVault } = require('./abis/bVault.js')

abis.mini = mini
abis.erc20 = erc20
abis.bLocker = bLocker
abis.bStaking = bStaking
abis.bVault = bVault

module.exports = { abis }