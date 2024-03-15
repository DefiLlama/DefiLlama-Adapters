const { get } = require('../helper/http')

const SNS_URL = "https://sns-api.internetcomputer.org/api/v1/snses/"
const ICP_URL = "https://ledger-api.internetcomputer.org/accounts/"

async function tvl(_ts, _b, _cb, { api, }) {
  let offset = 0;
  const limit = 100;
  var icp_balance = 0;
  while (true) {
    let data = await get(SNS_URL + `?offset=${offset}&limit=${limit}&sort_by=name`);
    let snses = data.data;
    if (snses.length == undefined || snses.length == 0) {
      break;
    }

    for (let i = 0; i < snses.length; i++) {
      let sns = snses[i];
      let root_canister_id = sns.root_canister_id;
      var { data, status } = await get(
        SNS_URL + `${root_canister_id}`);

      let icp_ledger_treasury_accountidentifier = data.icp_treasury_account;
      var { data, status } = await get(
        ICP_URL + `${icp_ledger_treasury_accountidentifier}`);
      icp_balance += parseInt(data.balance);
    }
    offset += limit;
  }

  api.add('coingecko:icp', icp_balance / 1e8, { skipChain: true })
  return api.getBalances()
}

module.exports = {
  methodology: `We count the ICP on all SNS treasuries accounts as the collateral`,
  icp: {
    tvl
  },
}