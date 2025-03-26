const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require('../helper/coreAssets.json')

const router = "EQC_-t0nCnOFMdp7E7qPxAOCbCWGFz-e3pwxb6tTvFmshjt5"
const wtTOn = "EQCHHakhWxSQIWbw6ioW21YnjVKBCDd_gVjF9Mz9_dIuFy23"

module.exports = {
  timetravel: true,
  ton: {
    tvl: sumTokensExport({ owners: [router, wtTOn], tokens: [ADDRESSES.null], }),
  }
}
