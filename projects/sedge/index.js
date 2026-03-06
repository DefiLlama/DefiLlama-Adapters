const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const LIQUIDITY_POOLS = [
    '0x3fb5e30D3cE5f3f194c90a2689B1fD20C82F1637', // CADC/USDC
    '0x86fFFd464875581A0f4b7b2Ea1187C74C6FB9FBa', //EURC/USDC
    '0xc015f66ad7780dF4D73F99c5cEe415Eb6B26aCB0'  //IDRX/USDC
];

const TOKENS = [
    ADDRESSES.base.USDC,
    '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', //EURC
    '0x043eB4B75d0805c43D7C834902E335621983Cf03', //CADC
    '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22' //IDRX
];

module.exports = {
    methodology: `TVL is comprised of tokens locked in sedge's liquidty pools`,
    base: { tvl: sumTokensExport({ owners: LIQUIDITY_POOLS, tokens: TOKENS }) }
}