const sdk = require('@defillama/sdk')
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const chain = 'arbitrum'

async function tvl(timestamp, _b, chainBlocks) {
  const block = chainBlocks[chain]
  const logs = await getLogs({
    chain, timestamp, chainBlocks,
    toBlock: block,
    fromBlock: 33934273,
    eventAbi: abis.MarketCreated,
    topics: ['0xf38f00404415af51ddd0dd57ce975d015de2f40ba8a087ac48cd7552b7580f32'],
    target: '0x984e0eb8fb687afa53fc8b33e12e04967560e092',
  })

  const vaults = logs.map(({ args }) => ([args.hedge, args.risk])).flat()
  console.log(vaults.length)
  const tokens = await sdk.api2.abi.multiCall({
    abi: 'address:asset',
    calls: vaults,
    chain, block,
  })
  const tokensAndOwners = tokens.map((token, i) => ([token, vaults[i]]))

  return sumTokens2({ chain, block, tokensAndOwners })
}


module.exports = {
  arbitrum: {
    tvl,
    staking: sumTokensExport({ chain, owners: [], tokens: ['0x65c936f008BC34fE819bce9Fa5afD9dc2d49977f']})
  }
}

const abis = {
  MarketCreated: { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "mIndex", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "hedge", "type": "address" }, { "indexed": false, "internalType": "address", "name": "risk", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "int256", "name": "strikePrice", "type": "int256" }], "name": "MarketCreated", "type": "event" },
}