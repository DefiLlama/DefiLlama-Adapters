// ICP query client and the CBOR / Candid / Principal codec live in @defillama/sdk (`sdk.chains.icp`)
const sdk = require('@defillama/sdk')
const { icp } = sdk.chains

const ICP_DECIMALS = 8

// native ICP balance (whole coins) of a ledger account.
// `owner` is either a 64-hex account identifier (what exchanges publish) or a principal text
async function getIcpBalance(owner) {
  const accountIdentifierHex = icp.isPrincipal(owner) ? icp.accountIdentifierFromPrincipal(owner) : owner
  const e8s = await icp.getIcpAccountBalance({ accountIdentifierHex })
  return Number(e8s) / 10 ** ICP_DECIMALS
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners)
    total += await getIcpBalance(owner)
  sdk.util.sumSingleBalance(balances, 'internet-computer', total)
  return balances
}

module.exports = {
  queryCanister: icp.queryCanister,
  decodeCandid: icp.decodeCandid,
  hashCandidLabel: icp.hashCandidLabel,
  getIcpBalance,
  sumTokens,
}
