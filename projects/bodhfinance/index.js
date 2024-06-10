const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require('../helper/compound')

const WETH = ADDRESSES.metis.Metis
const bETH = "0xe970c37243F3d0B2AeB041b855Ef6466CB140BcA"
const unitroller = "0x97b491744587d05ca33e84bB18B61Df9B3986DcE"

const { tvl, borrowed } = compoundExports(
    unitroller, "boba", bETH, WETH, );

module.exports = {
            methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
    boba: { tvl, borrowed }
}
