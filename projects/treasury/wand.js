const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const styTreasury = '0x462bd2d3c020f6986c98160bc4e189954f49634b'

async function styTvl(api) {
  // Token addresses
  const vIP = "0x5267F7eE069CEB3D8F1c760c215569b79d0685aD"
  const AIDaUSDC = "0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42"
  const canonicalUSDC = ADDRESSES.sty.USDC_e

  // Get balances directly
  const [vipBal, usdcBal] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: vIP, params: [styTreasury] }),
    api.call({ abi: 'erc20:balanceOf', target: AIDaUSDC, params: [styTreasury] }),
  ])

  // Add balances manually, mapping AIDaUSDC to canonical USDC
  api.add(vIP, vipBal)
  api.add(canonicalUSDC, usdcBal)

  return api.getBalances()
}

module.exports = {
  blast: {
    tvl: sumTokensExport({
      owners: [
        "0x462bd2d3c020f6986c98160bc4e189954f49634b", // treasury
      ],
      tokens: [ 
        ADDRESSES.null, // $ETH
        ADDRESSES.blast.USDB,  // $USDB
        ADDRESSES.blast.weETH  // weETH
      ]
    })
  },
  sty: { tvl: styTvl }
}