const { get } = require('../helper/http')

const SNS_URL = "https://sns-api.internetcomputer.org/api/v1/snses/"
const ICP_URL = "https://ledger-api.internetcomputer.org/accounts/"

async function tvl(api) {
  let offset = 0;
  const limit = 100;
  var icp_balance = 0;
  const a = true
  while (a) {
    let data = await get(SNS_URL + `?offset=${offset}&limit=${limit}&sort_by=name`);
    let snses = data.data;
    if (snses.length == undefined || snses.length == 0) {
      break;
    }

    for (let i = 0; i < snses.length; i++) {
      let sns = snses[i];
      let root_canister_id = sns.root_canister_id;
      let root_canister = await get(
        SNS_URL + `${root_canister_id}`);

      let icp_ledger_treasury_accountidentifier = root_canister.icp_treasury_account;
      let icp_ledger = await get(
        ICP_URL + `${icp_ledger_treasury_accountidentifier}`);
      icp_balance += parseInt(icp_ledger.balance);
    }
    offset += limit;
  }

  api.addCGToken('internet-computer', icp_balance / 1e8)
}

module.exports = {
  methodology: `We count the ICP on all SNS DAO treasuries accounts`,
  icp: {
    tvl
  },
}