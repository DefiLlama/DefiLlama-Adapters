const axios = require('axios')

const ROCKET_API = "https://beta.rocket-cluster-1.com";
const VAULT_ADDRESS = "0x6BC2179a284CB2A2857C379391E0158524de7cA0";

const tvl = async (api) => {
  const { data } = await axios.get(`${ROCKET_API}/vaults`)
  let vaults = data.vaults.map(({ address }) => address)
  if (!vaults.length) vaults = [VAULT_ADDRESS]

  let total = 0
  for (const vault of vaults) {
    const { data } = await axios.get(`${ROCKET_API}/collateral?account=${encodeURIComponent(vault)}`)
    total += Object.values(data.collaterals).reduce((sum, v) => sum + Number(v), 0)
  }
  api.addUSDValue(total)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: true,
  methodology: "TVL is calculated by summing all USDC collateral deposited in Rocket Liquidity Provider vaults",
  arbitrum: { tvl },
};