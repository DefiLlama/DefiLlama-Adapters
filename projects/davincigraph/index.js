const { fetchURL } = require("../helper/utils")

const URL = 'https://locker.davincigraph.io/api/v3/statistics'

const tvl = async (api) => {
  const { data } = await fetchURL(URL)
  return api.addUSDValue(Math.round(data.values.liquidity.total))
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: "The displayed value represents the Total Value Locked (TVL) in USD of all assets secured within the davincigraph token lockers, burners and vesting smart contracts, accessible at https://davincigraph.io/locks/contracts, /vestings/contracts and /burns/contracts.",
  hedera: { tvl }
};
