const { sumTokens } = require("../helper/chain/fuel")

// stFUEL (The Rig) — asset id on Fuel; needed explicitly because the bulk
// contractBalances path does not always surface this receipt token balance.
const ST_FUEL =
  "0x5505d0f58bea82a052bc51d2f67ab82e9735f0a98ca5d064ecb964b8fd30c474"

async function tvl(api) {
  const contractId = '0xd7795099227cc0b9dc5872d29ca2b10691d9db6bd45853a6bb532e68dd166ce3'
  const stakingContract = '0x79d2a26b57974e2b2e4d39dc189e818fcc86399337406dec65165b189a6f1ed7'
  const owners = [contractId, stakingContract]

  const balances = await sumTokens({ api, owners })
  if (balances[ST_FUEL]) return balances
  return sumTokens({ api, owners, tokens: [ST_FUEL] })
}

module.exports = {
  fuel: { tvl },
  timetravel: false,
}
