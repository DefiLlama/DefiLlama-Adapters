const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const [markets] = await api.call({ target: '0xd350c2b3d8eb1de65cfa68928ea135eda88326b6', abi: "function getAllActiveMarkets() view returns (address[], string[], bool[])"})
  const tokens = await api.multiCall({  abi: 'address:collateralToken', calls: markets})
  return sumTokens2({ api, tokensAndOwners2: [tokens, markets]})
}

module.exports = {
  arbitrum: { tvl }
}