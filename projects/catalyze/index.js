axios = require("axios");

const SNS_URL = "https://sns-api.internetcomputer.org/api/v1/snses/uly3p-iqaaa-aaaaq-aabma-cai"
const ICP_URL = "https://ledger-api.internetcomputer.org/accounts/"

async function tvl() {
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

  return icp_balance;
}

module.exports = {
  methodology: `We count the ICP on the treasury account as the collateral for Catalyze`,
  icp: { tvl: tvl },
}
