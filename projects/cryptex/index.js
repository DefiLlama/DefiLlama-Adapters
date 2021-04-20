const sdk = require("@defillama/sdk");

async function tvl(timestamp, block) {
  let balances = {};

  const results = await sdk.api.abi.multiCall({
    block,
    abi: 'erc20:balanceOf',
    calls: [{
      target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      params: ['0x717170b66654292dfbd89c39f5ae6753d2ac1381']
    },
    {
      target: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      params: ['0x443366a7a5821619d8d57405511e4fadd9964771']
    }]
  })
  sdk.util.sumMultiBalanceOf(balances, results)

  return balances
}

module.exports = {
  tvl
}
