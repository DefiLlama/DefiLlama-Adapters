const sdk = require('@defillama/sdk')
const { gmxExports } = require("../helper/gmx")
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const vaultOp = "0x10235996C4DAbCE8430a71Cbc06571bd475A1d0C";
const customWETHOp = "0xd158b0f013230659098e58b66b602dff8f7ff120";

const VaultBase = "0x1ce0EBd2b95221b924765456fdE017B076E79dbe";
const customWETHBase ="0xd6c5469A7cc587E1E89A841FB7c102FF1370C05F";

const wethTvlOp = sumTokensExport({ owner: customWETHOp, tokens: [nullAddress]})
const fxdxTVLOp = gmxExports({ vault: vaultOp, blacklistedTokens: [customWETHOp] })

const wethTvlBase = sumTokensExport({ owner: customWETHBase, tokens: [nullAddress]})
const fxdxTVLBase = gmxExports({ vault: VaultBase, blacklistedTokens: [customWETHBase] })

module.exports = {
  optimism: {
    tvl: sdk.util.sumChainTvls([fxdxTVLOp, wethTvlOp]),
  },
  base:{
    tvl: sdk.util.sumChainTvls([fxdxTVLBase, wethTvlBase]),
  }
};
