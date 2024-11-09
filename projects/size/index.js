const { nullAddress } = require("../helper/tokenMapping");

async function tvl(api) {
  const orderBook = '0x044d9b2c4d8a696fe83fbb723f6006bd2d7a0e7e'
  const aaveModule = await api.call({ abi: 'address:aaveModule', target: orderBook })
  const aaveToken = await api.call({ abi: 'address:aToken', target: aaveModule })
  return api.sumTokens({
    tokensAndOwners: [
      [aaveToken, aaveModule],
      [nullAddress, orderBook],
    ]
  })
}

module.exports = {
  methodology: "Counts assets ETH collateral deposited + USDC deposited and available to borrow",
  base: {
    tvl
  }
}
