const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')

const contract = "0x2Ac995E7945472da0C1077a0A00E0CF914baE0cC"

module.exports = {
  methodology: `We count the HYPE on ${contract}`,
  hyperliquid: {
    tvl: sumTokensExport({ owner: contract, tokens: [nullAddress], }),
  }
}
