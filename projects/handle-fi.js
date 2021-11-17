const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const {sumTokens} = require('./helper/unwrapLPs');

// Retrieve tokens stored in treasury contract - only weth at the moment
// https://arbiscan.io/address/0x5710B75A0aA37f4Da939A61bb53c519296627994
const treasuryContract = '0x5710B75A0aA37f4Da939A61bb53c519296627994'
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const treasureTokens = [WETH]

async function arbitrum_onchain(timestamp, block, chainBlocks, chain) {
  const balances = {}
  await sumTokens(balances, treasureTokens.map(
    t => [t, treasuryContract]
  ), chainBlocks.arbitrum, 'arbitrum', addr=>`arbitrum:${addr}`)
  return balances
}

module.exports = {
  arbitrum: {
    tvl: arbitrum_onchain
  },
  methodology: `TVL is sum of al collateralTokens provided in vaults to mint any fxTokens. We can do an on-chain call to the ERC20 held in the treasuryContract.`
}
