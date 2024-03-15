axios = require("axios");

const SNS_URL = "https://sns-api.internetcomputer.org/api/v1/snses/"
const ICP_URL = "https://ledger-api.internetcomputer.org/accounts/"

async function tvl(_ts, _b, _cb, { api, }) {
  let offset = 0;
  const limit = 100;
  var icp_balance = 0;
  while (true) {
    var { data, status } = await axios.get(
      SNS_URL + `?offset=${offset}&limit=${limit}&sort_by=name`
      ,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
    let snses = data.data;
    if (snses.length == undefined || snses.length == 0) {
      break;
    }

    for (let i = 0; i < snses.length; i++) {
      let sns = snses[i];
      let root_canister_id = sns.root_canister_id;
      var { data, status } = await axios.get(
        SNS_URL + `${root_canister_id}`
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
      icp_balance += parseInt(data.balance);
    }
    offset += limit;
  }

  api.add('coingecko:icp', icp_balance / 1e8, { skipChain: true })
}

module.exports = {
  methodology: `We count the ICP on all SNS treasuries accounts as the collateral`,
  icp: {
    tvl
  },
}