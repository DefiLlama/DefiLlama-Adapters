const sdk = require('@defillama/sdk')
const { gmxExports } = require("../helper/gmx")
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const optimismvault = "0x10235996C4DAbCE8430a71Cbc06571bd475A1d0C";
const customWETH = '0xd158b0f013230659098e58b66b602dff8f7ff120'
const wethTvl = sumTokensExport({ owner: customWETH, tokens: [nullAddress]})
const gmxTVL = gmxExports({ vault: optimismvault, blacklistedTokens: [customWETH] })

module.exports = {
  optimism: {
    tvl: sdk.util.sumChainTvls([gmxTVL, wethTvl]),
  },
};
