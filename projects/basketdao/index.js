const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const dpiToken = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'
const dpiEthToken = '0x4d5ef58aAc27d99935E5b6B4A6778ff292059991'
const masterChef = '0xDB9daa0a50B33e4fe9d0ac16a1Df1d335F96595e'

async function tvl(timestamp, block) {
  let balances = {};
  const dpiLocked = sdk.api.erc20.balanceOf({
    target: dpiToken,
    owner: masterChef,
    block
  })
  const dpiLPLocked = sdk.api.erc20.balanceOf({
    target: dpiEthToken,
    owner: masterChef,
    block
  })
  await unwrapUniswapLPs(balances, [{
    token: dpiEthToken,
    balance: (await dpiLPLocked).output
  }], block)
  sdk.util.sumSingleBalance(balances, dpiToken, (await dpiLocked).output)
  return balances
}

module.exports = {
  name: 'BasketDAO',
  token: 'BASK',
  category: 'Indexes',
  start: 0, // WRONG!
  tvl
}