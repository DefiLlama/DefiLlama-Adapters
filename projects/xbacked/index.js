const axios = require('axios');
const retry = require('../helper/retry');

async function tvl() {
  const response = (
    await retry(
      async () => await axios.get(
        'http://xback-LoadB-77J86FESSSEN-2befef5c80c440ac.elb.us-west-2.amazonaws.com:4001/api/v1/getTVL'
      )
    )
  )
cd
  const data = response.data
  console.log(parseFloat(data));
  return parseFloat(data);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Sums the total locked collateral value in usd across all vaults.",
  algorand: {
    tvl
  }
}
