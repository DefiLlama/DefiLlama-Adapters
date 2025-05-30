const { sumTokens2, nullAddress } = require("../helper/unwrapLPs")

const markets = [
  '0x0e2c1659B6A120CFE582717b51444389878676Ac', // HBAR_MARKET
  '0xA810340Ca70e24aF6d6C3e59A3d2b88E6d5f1F27', // USDC_MARKET
  '0x086eDAe2722FE6F355793adF8F19fAeE93aca7d6', // SAUCE_MARKET
  '0x7D0f4cD67301afAdbbBF3512F31aF9247a37e7a7', // XSAUCE_MARKET
  '0xdd9FA7C0080062df71d729fBA6EEf074C5F03A45', // HBARX_MARKET
  '0xb9a76104658AbBB998C8b146dF9c523b3b3D271b', // HSUITE_MARKET
  '0x23E49b26D82674eea26E49f447D8a00dae7Ff01B', // PACK_MARKET
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: markets })
  tokens[0] = nullAddress  // replace wrapped token with gas token
  return sumTokens2({ api, tokensAndOwners2: [tokens, markets] })
}

async function borrowed(api) {
  const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: markets })
  const bals = await api.multiCall({ abi: 'uint256:totalBorrows', calls: markets })
  api.add(tokens, bals)
  return sumTokens2({ api, })
}

module.exports = {
  methodology: "TVL on Sirio Finance",
  timetravel: false,
  hedera: { tvl, borrowed, }
}

module.exports.deadFrom = '2025-02-01'
module.exports.hedera.borrowed=  () => ({})
module.exports.hallmarks = [
  ['2025-02-01', "Protocol Exploit"],
]
