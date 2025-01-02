const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs")
const { staking } = require("../helper/staking")

const treasuryContract = "0x5710B75A0aA37f4Da939A61bb53c519296627994"
const WETH_FOREX_sushi_LP = '0x9745e5cc0522827958ee3fc2c03247276d359186'
const LP_staking_contract = '0x5cdeb8ff5fd3a3361e27e491696515f1d119537a'

async function tvl(api) {
  return sumTokens2({ api, owner: treasuryContract, tokens: [ADDRESSES.arbitrum.WSTETH, ADDRESSES.arbitrum.WETH] })
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: staking(LP_staking_contract, WETH_FOREX_sushi_LP)
  },
  methodology: `TVL on arbitrum is sum of all collateralTokens (weth only atm) provided in vaults to mint any fxTokens on arbitrum. TVL on mainnet is given by collateral provided to Rari Fuse pools #72 and #116 against WETH, FEI, DAI, USDC, USDT, FRAX for now.`,
}
