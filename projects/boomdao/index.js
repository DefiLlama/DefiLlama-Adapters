axios = require("axios");

const SNS_URL = "https://sns-api.internetcomputer.org/api/v1/snses/xjngq-yaaaa-aaaaq-aabha-cai"
const ICP_URL = "https://ledger-api.internetcomputer.org/accounts/"

async function tvl() {
  const { api } = arguments[3]
  var { data, status } = await axios.get(
    SNS_URL
    ,
    {
        headers: {
            Accept: 'application/json',
        },
    },
);

let icp_ledger_treasury_accountidentifier = data.icp_treasury_account;
var { data, status } = await axios.get(
  ICP_URL + `${icp_ledger_treasury_accountidentifier}`
  ,
  {
      headers: {
          Accept: 'application/json',
      },
  },
);

let icp_balance = data.balance;
api.add('coingecko:icp', icp_balance / 1e8)
return api.getBalances()
}

module.exports = {
  methodology: `We count the ICP on the treasury account as the collateral for the BoomDAO`,
  icp: { tvl: tvl },
}
