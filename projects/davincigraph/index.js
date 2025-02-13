const { fetchURL } = require("../helper/utils")

async function fetch() {
  const response = await fetchURL(
    "https://locker.davincigraph.io/api/v3/statistics"
  );

  return response.data.values.liquidity.total;
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    "The displayed value represents the Total Value Locked (TVL) in USD of all assets secured within the davincigraph token lockers, burners and vesting smart contracts, accessible at https://davincigraph.io/locks/contracts, /vestings/contracts and /burns/contracts.",
  hedera: {
    fetch
  },
  fetch
};
