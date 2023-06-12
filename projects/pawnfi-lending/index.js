const ABI = require("../pawnfi/helper/abi.json")
const { Lending,LendCToken } = require("../pawnfi/helper/config.js")
const sdk = require("@defillama/sdk")


async function borrowed(timestamp, block, _, { api }) {
  const tokens = []
  const bals = []
  const items = await api.call({ 
    abi: ABI.cTokenMetadataAll, 
    target: Lending,
    params: [LendCToken],
  })
  items.forEach((v) => {
    tokens.push(v['underlyingAssetAddress'])
    bals.push(v['totalBorrows'])
  })
  const balances = {}
  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v, api.chain))
  return balances
}


async function tvl(timestamp, block, _, { api }) {
  const tokens = []
  const bals = []
  const items = await api.call({ 
    abi: ABI.cTokenMetadataAll, 
    target: Lending,
    params: [LendCToken],
  })
  items.forEach((v) => {
    tokens.push(v['underlyingAssetAddress'])
    bals.push(v['totalCash'])
  })
  const balances = {}
  bals.forEach((v, i) => sdk.util.sumSingleBalance(balances, tokens[i], v, api.chain))
  return balances
}


module.exports = module.exports = {
   ethereum: {
       tvl: tvl,
       borrowed: borrowed
   }
}
