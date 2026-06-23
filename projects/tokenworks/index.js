const { getLogs2 } = require("../helper/cache/getLogs")
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs")

async function tvl(api) {

  await punkStrategyTvl(api)

  const factory = '0xA1a196b5BE89Be04a2c1dc71643689CE013c22e5'
  const logs = await getLogs2({
    api,
    fromBlock: 23398278,
    target: factory,
    eventAbi: 'event NFTStrategyLaunched (address indexed collection, address indexed nftStrategy, string tokenName, string tokenSymbol)'
  })

  // add ETH and NFTs held by all strategies
  const ownerTokens = logs.map(i => [[nullAddress, i.collection], i.nftStrategy])
  await api.sumTokens({ ownerTokens })

  // add liquidity in uniswap v4 pools 
  return sumTokens2({
    api, owner: factory, resolveUniV4: true, uniV4ExtraConfig: {
      whitelistedTokens: [nullAddress],
    }
  })
}

module.exports = {
  doublecounted: true,  // same eth is counted towards uni v4 tvl
  methodology: `Counts liquidity belonging to the protocol in the Uniswap V4 pools (only ETH part), and ETH & NFTs on the strategy contracts`,
  start: '2025-09-06',
  ethereum: { tvl, },
}


// punk strategy is special case as the token had a bug and was patched
async function punkStrategyTvl(api) {
  // add PUNK balance
  await api.sumTokens({ owner: '0x1244EAe9FA2c064453B5F605d708C0a0Bfba4838', tokens: ['0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB'] })

  await sumTokens2({
    api,
    resolveUniV4: true,
    owner: '0xc50673EDb3A7b94E8CAD8a7d4E0cD68864E33eDF',
    tokens: [nullAddress,],

    uniV4ExtraConfig: { positionIds: ['61403'], whitelistedTokens: [nullAddress], }
  })
}