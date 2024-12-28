const axios = require ("axios")

const SNS_URL = "https://sns-api.internetcomputer.org/api/v1/snses"
const ICP_URL = "https://ledger-api.internetcomputer.org/accounts"

async function tvl(api) {
  const { data } = await axios.get(SNS_URL)

  for (const sns of data.data) {
    const root_canister_id = sns.root_canister_id
    const root_canister = await axios.get(SNS_URL + `/${root_canister_id}`)
    const icp_ledger_treasury_accountidentifier = root_canister.data.icp_treasury_account
    const icp_ledger = await axios.get(ICP_URL + `/${icp_ledger_treasury_accountidentifier}`)
    const icp_balance = parseInt(icp_ledger.data.balance)
    api.addCGToken('internet-computer', icp_balance / 1e8)
  }
}

module.exports = {
  methodology: `We count the ICP on all SNS DAO treasuries accounts`,
  icp: {
    tvl
  },
}