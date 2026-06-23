const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

async function tvl(api) {
  // add PUNK balance
  await api.sumTokens({ owner: '0x1244EAe9FA2c064453B5F605d708C0a0Bfba4838', tokens: ['0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB'] })
  // Use the correct Uniswap v4 position resolver
  await sumTokens2({
    api,
    resolveUniV4: true,
    owner: '0xc50673EDb3A7b94E8CAD8a7d4E0cD68864E33eDF',
    tokens: [nullAddress,],

    uniV4ExtraConfig:{ positionIds: ['61403']}
  })
  api.getBalancesV2().removeTokenBalance('0xc50673EDb3A7b94E8CAD8a7d4E0cD68864E33eDF') // remove own token from tvl
}

module.exports = {
  start: '2025-09-06',
  methodology: `Counts liquidity belonging to the protocol in the Uniswap V4 pools (only ETH part), and ETH & PUNKS on the contract`,
  doublecounted: true,
  ethereum: { tvl }
}; 