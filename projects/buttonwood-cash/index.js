const { sumTokens2 } = require('../helper/unwrapLPs')

const GENERAL_MANAGER = '0xc127d8aBcbB08f7A5C0442AE5A24883027bd910C'

async function tvl(api) {
  const [consol, usdx] = await Promise.all([
    api.call({ target: GENERAL_MANAGER, abi: 'address:consol' }),
    api.call({ target: GENERAL_MANAGER, abi: 'address:usdx' }),
  ])
  const [inputs, fap, usdTokens] = await Promise.all([
    api.call({ target: consol, abi: 'address[]:getSupportedTokens' }),
    api.call({ target: consol, abi: 'address:forfeitedAssetsPool' }),
    api.call({ target: usdx, abi: 'address[]:getSupportedTokens' }),
  ])
  // Every other Consol input is a SubConsol holding one collateral
  const skip = new Set([fap, usdx].map((a) => a.toLowerCase()))
  const subConsols = inputs.filter((a) => !skip.has(a.toLowerCase()))

  const [collaterals, yieldAmounts, fapAssets] = await Promise.all([
    api.multiCall({ abi: 'address:collateral', calls: subConsols }),
    api.multiCall({ abi: 'uint256:yieldAmount', calls: subConsols }),
    api.fetchList({ lengthAbi: 'uint256:totalAssets', itemAbi: 'function getAsset(uint256) view returns (address)', target: fap }),
  ])

  // Collateral a SubConsol has moved to a yield strategy, at its deposited amount
  collaterals.forEach((c, i) => api.add(c, yieldAmounts[i]))

  return sumTokens2({
    api,
    tokensAndOwners: [
      ...collaterals.map((c, i) => [c, subConsols[i]]),
      ...usdTokens.map((t) => [t, usdx]),
      ...fapAssets.map((a) => [a, fap]),
    ],
  })
}

module.exports = {
  methodology:
    'TVL is the tokenized-equity collateral held by each SubConsol for open mortgages (including any amount moved to a yield strategy), the stablecoins backing USDX, and assets held by the Forfeited Assets Pool from foreclosed mortgages. USDX, Consol, SubConsol and Forfeited Assets Pool tokens held by origination pools, vaults or users are claims on these same assets and are not counted.',
  start: '2026-09-23',
  robinhood: { tvl },
}
