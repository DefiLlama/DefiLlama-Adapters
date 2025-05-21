const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require('../helper/unwrapLPs')

const WUSDC_VAULT = "0x41AA6785b4ffE18A79bba796793E828059Ff342a"
const WETH_VAULT = "0x367750af92a2C427Cc94E1c562DEa9753a42c27e"
const ELK_VAULT = "0x1EAf38375CA45685D3FCa0c53e9fa6b02bb9B0D5"

const owners = [
    WUSDC_VAULT,
    WETH_VAULT,
    ELK_VAULT,
]
const tokens = [
    ADDRESSES.q.WUSDC,
    ADDRESSES.q.WETH,
    ADDRESSES.q.ELK,
]

module.exports = {
    q: { tvl: sumTokensExport({ owners, tokens }) },
};