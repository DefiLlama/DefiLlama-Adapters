const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs');

module.exports = {
  methodology: "Tracks funds locked in the ERC20Peg contract on Ethereum",
  ethereum: {
    tvl: sumTokensExport({ owner: '0x76BAc85e1E82cd677faa2b3f00C4a2626C4c6E32', tokens: [nullAddress] })
  }
}