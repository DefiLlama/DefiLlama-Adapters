const { getAdaInAddress, sumTokens2 } = require("../helper/chain/cardano");
const { assetsAddresses } = require('../helper/chain/cardano/blockfrost');

async function adaHandleToAddress(handle) {
  // https://docs.adahandle.com/reference/api-reference/cardano-node
  const policyID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
  const assetName = Buffer.from(handle).toString('hex');
  const [holder] = await assetsAddresses(`${policyID}000de140${assetName}`)
  return holder.address
}

const V1_PROTOCOL_SCRIPT_ADDRESS = "addr1xywgm3cqq35eh8p83x7gymkgqs8r9zzeg9sgq74d59apepgu3hrsqprfnwwz0zdusfhvspqwx2y9jstqspa2mgt6rjzs2v0fp9"

async function tvl() {
  const TREASURY_ADDRESS = await adaHandleToAddress('bigblymp')

  // Treasury Funds
  const treasuryAda = await getAdaInAddress(TREASURY_ADDRESS)
  const treasuyTokens = await sumTokens2({ 
    owners: [
      TREASURY_ADDRESS,
    ], 
    tokens: [
      // CBLP, USDM
      'ee0633e757fdd1423220f43688c74678abde1cead7ce265ba8a24fcd43424c50',
      'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'
    ],
  })

  // Tokens Held in V1 Contracts
  const v1Ada = await getAdaInAddress(V1_PROTOCOL_SCRIPT_ADDRESS)
  const v1Tokens = await sumTokens2({ 
    owners: [
      V1_PROTOCOL_SCRIPT_ADDRESS,
    ], 
    tokens: [
      // CBLP, USDM
      'ee0633e757fdd1423220f43688c74678abde1cead7ce265ba8a24fcd43424c50',
      'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'
    ],
  })

  const ada = Number(treasuryAda) + Number(v1Ada)
  const cblp = (Number(treasuyTokens['cardano:ee0633e757fdd1423220f43688c74678abde1cead7ce265ba8a24fcd43424c50'] ?? 0) + Number(v1Tokens['cardano:ee0633e757fdd1423220f43688c74678abde1cead7ce265ba8a24fcd43424c50'] ?? 0)) / 1e6
  const usdm = (Number(treasuyTokens['cardano:c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'] ?? 0) + Number(v1Tokens['cardano:c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d']) ?? 0) / 1e6

  return { cardano: ada, 'coingecko:yamfore': cblp, 'coingecko:usdm-2': usdm }
}

module.exports = {
  cardano: {
    tvl
  },
  start: 1728878400,
  methodology: "TVL is equal to all ADA, CBLP and USDM (USDM by Moneta) held in the treasury and unlent funds, collected fees and loan collateral held by the V1 script.",
  hallmarks:[
    [1728878400, "Launch"]
  ],
};
