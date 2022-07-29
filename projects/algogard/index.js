
const { lookupApplications, lookupAccountByID, searchAccounts, } = require("../helper/algorand");
const { toUSDTBalances } = require("../helper/balances");

const reserveAddress = "J2E2XXS4FTW3POVNZIHRIHTFRGOWEWX65NFYIVYIA27HUK63NWT65OLB2Y"
const treasuryAddress = "MTMJ5ADRK3CFG3HGUI7FS4Y55WGCUO5CRUMVNBZ7FW5IIG6T3IU2VJHUMM"

const oracleAppId = 673925841
const gardId = 684649988
const gardPriceValidatorId = 684650147

function getStateUint(state, key) {
  const val = state.find((entry) => {
    if (entry.key === key) {
      return entry;
    }
  })
  return val.value.uint
}

async function getAppState(appId) {
  const res = await lookupApplications(appId);
  return res.application.params["global-state"];
}

/* Get Algo/USD price from oracle */
async function getAlgoPrice() {
  const state = await getAppState(oracleAppId);
  const price = getStateUint(state, 'cHJpY2U=')
  const oracleDecimals = getStateUint(state, 'ZGVjaW1hbHM=')
  return price / (10 ** oracleDecimals);
}

/* Get value locked in user-controlled smart contracts */
async function getAlgoGovernanceAccountBalsUsd(price) {

  let nexttoken
  let response = null
  let totalContractAlgo = 0
  do {
    // Find accounts that are opted into the GARD price validator application
    // These accounts correspond to CDP opened on the GARD protocol
    response = await searchAccounts({
      appId: gardPriceValidatorId,
      limit: 1000,
      nexttoken,
    });
    for (const account of response['accounts']) {
      totalContractAlgo += (account['amount'] / Math.pow(10, 6))
    }
    nexttoken = response['next-token']
  } while (nexttoken != null);

  return totalContractAlgo * price
}

/* Get value locked in treasury */
async function getTreasuryBalUsd(price) {

  const info = await lookupAccountByID(treasuryAddress)
  const treasuryBal = info.account.amount;
  return treasuryBal * price / 1e6 // 1e6 comes from converting from microAlgos to Algos 
}

/* Get total deposits */
async function tvl() {
  const price = await getAlgoPrice();

  const [treasuryBal, algoGovernanceDepositUsd] =
    await Promise.all([
      getTreasuryBalUsd(price),
      getAlgoGovernanceAccountBalsUsd(price),
    ]);

  return toUSDTBalances(treasuryBal + algoGovernanceDepositUsd);
}

/* Get total borrows */
async function borrowed() {

  const info = await lookupAccountByID(reserveAddress)
  const gardBalance = info.account.assets?.find((asset) => asset["asset-id"] === gardId).amount;
  return (92e17 - gardBalance) / 1e6
  // Contract is initialized with 9.2 quintillion microGARD. Each GARD is pegged to $1
}

async function borrowedBalances() {
  return toUSDTBalances(await borrowed())
}

async function treasuryBalances() {
  const price = await getAlgoPrice();
  return toUSDTBalances(await getTreasuryBalUsd(price))
}

module.exports = {
  algorand: {
    tvl,
    borrowed: borrowedBalances,
    treasury: treasuryBalances,
  }
}
