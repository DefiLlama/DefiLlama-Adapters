//const { sumTokensExport } = require('../helper/sumTokens')
const axios = require("axios")

async function tvl() {
  var end = Math.floor(Date.now()/1000);
  let start = end - 10000;
  console.log(end);
  console.log(start);
  const { data, status } = await axios.get(
    `https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/total-supply?start=${start}&end=${end}&step=1`,
    {
        headers: {
            Accept: 'application/json',
        },
    },
);
let tokens = data.data.slice(-1)[0][1]
return tokens;
}



module.exports = {
  methodology: `We count the BTC as the collateral for the ckBTC`,
  icp: { tvl: tvl },
}
