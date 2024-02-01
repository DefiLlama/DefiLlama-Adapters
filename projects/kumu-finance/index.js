const sdk = require("@defillama/sdk")
const abi = require('./abi')
const chain = 'klaytn'
const { sumUnknownTokens, } = require("../helper/unknownTokens")

const contract = '0x7886eFbA097A7187f7AeC12913B54BbC9F258faC'
const kumu = '0xe764d24563a5931fc5f716a78bd558a9a1bff55d'

async function tvl(_, _b, { [chain]: block }) {
  const { output: length } = await sdk.api.abi.call({
    target: contract,
    abi: abi.poolLength,
    chain, block,
  })

  const calls = []
  for (let i = 1; i < length; i++) calls.push({ params: [i] })
  const { output: data } = await sdk.api.abi.multiCall({
    target: contract,
    abi: abi.poolInfo2,
    calls,
    chain, block,
  })
  const toa = []
  let tokens = []

  data.forEach(({ output }) => {
    tokens.push(output.lpToken)
    toa.push([output.lpToken, output.strat0])
  })

  // const { updateBalances } = await getTokenPrices({ chain, block, coreAssets: [], lps: tokens, })

  const balances = await sumUnknownTokens({ tokensAndOwners: toa, chain, block, useDefaultCoreAssets: true, })
  // await updateBalances(balances)
  return balances
}

async function staking(_, _b, { [chain]: block }) {
  return sumUnknownTokens({ owner: '0x4ccE2F85f8E419c875b2d232150A5843Dd907b26', chain, block, tokens: [kumu] })
}

module.exports = {
  hallmarks: [
    [1662336000, "Rug Pull"]
  ],
  klaytn: {
    tvl, staking
  }
}