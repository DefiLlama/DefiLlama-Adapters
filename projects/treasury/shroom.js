// Shroom's treasury and its protocol owned liquidity are the same thing, so the Treasury dashboard
// entry reuses the protocol adapter rather than duplicating the position discovery.
module.exports = require('../shroom')
