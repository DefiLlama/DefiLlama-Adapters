// ICP query client and the CBOR / Candid / Principal codec live in @defillama/sdk (`sdk.chains.icp`)
const { icp } = require('@defillama/sdk').chains

module.exports = {
  queryCanister: icp.queryCanister,
  decodeCandid: icp.decodeCandid,
  hashCandidLabel: icp.hashCandidLabel,
}
