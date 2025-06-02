const { sumTokensExport } = require('../helper/unwrapLPs');
const tokens = require('./safelist.json').map(i => i.address)

const vanillaRouterAddress = '0x72C8B3aA6eD2fF68022691ecD21AEb1517CfAEa6'

module.exports = {
  ethereum: { tvl: sumTokensExport({ tokens, owner: vanillaRouterAddress }) },
}
