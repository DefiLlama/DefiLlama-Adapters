const { getLogs } = require("../helper/cache/getLogs")
const { sumTokens2 } = require("../helper/unwrapLPs")
const BLAST_MARKETS = "0xB40DBBb7931Cfef8Be73AEEC6c67d3809bD4600B"
const FROM_BLOCK = 2890000

async function tvl(timestamp, _, _1, { api }) {
  const logs = await getLogs({
    api,
    target: BLAST_MARKETS,
    topics: [
      "0xb5a3664443cdf63934025ca85796acceaccbdc33b3e93ba963df1fc863c58086",
    ],
    eventAbi: "event MarketCreated(bytes32 indexed, address, address, uint256)",
    onlyArgs: true,
    fromBlock: FROM_BLOCK,
  })
  const uniqueCollateral = new Set()
  logs.forEach((log) => uniqueCollateral.add(log[2]))
  const collateralAddresses = Array.from(uniqueCollateral)
  // Map each unique address with the BLAST_MARKETS constant
  const tokensAndOwners = collateralAddresses.map((address) => [
    address,
    BLAST_MARKETS,
  ])
  // Call sumTokens2 function with dynamically generated tokensAndOwners array
  return sumTokens2({
    api,
    tokensAndOwners: tokensAndOwners,
  })
}

module.exports = {
  misrepresentedTokens: false,
  blast: {
    tvl,
  },
}
