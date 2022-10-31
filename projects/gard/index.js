
const { lookupApplications, lookupAccountByID, searchAccountsAll, } = require("../helper/algorand");
const { toUSDTBalances } = require("../helper/balances");

const reserveAddress = "J2E2XXS4FTW3POVNZIHRIHTFRGOWEWX65NFYIVYIA27HUK63NWT65OLB2Y"
const v2ReserveAddress = "IRM4Q5KJPRJKWTFB2KONUZVUKH2X7INOEYIPWCRRUZ65VXGNPFXFDXJKOE"
const treasuryAddress = "MTMJ5ADRK3CFG3HGUI7FS4Y55WGCUO5CRUMVNBZ7FW5IIG6T3IU2VJHUMM"
const v2TreasuryAddress = "52O7EFC7TQPGSSM7HE6NDXMUUYM2W5OI4IOCDPTYJLPUYDO7BMNK5SCPEY"

const oracleAppId = 673925841
const gAlgoOracleId = 908941119
const gardId = 684649988
const gardPriceValidatorId = 684650147
const v2GardPriceValidatorId = 890603991
const sgardGardId = 890603920

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

/* Get gAlgo/USD price from oracle */
async function gAlgoPrice() {
  const state = await getAppState(oracleAppId);
  const price = getStateUint(state, 'cHJpY2U=')
  const oracleDecimals = getStateUint(state, 'ZGVjaW1hbHM=')
  return price / (10 ** oracleDecimals);
}

async function getV2GardDebt() {
  const validatorState = await getAppState(v2GardPriceValidatorId);
  const SGardDebt = getStateUint(validatorState, btoa('SGARD_OWED'))

  const sgardState = await getAppState(sgardGardId);
  const SGardConversion = getStateUint(sgardState, btoa('conversion_rate'))

  return SGardDebt * SGardConversion / 1e10
}

/* Get value locked in user-controlled smart contracts */
async function getAlgoGovernanceAccountBalsUsd(price, gprice) {

  let totalContractAlgo = 0
  let totalContractgAlgo = 0

  const validators = [gardPriceValidatorId, v2GardPriceValidatorId]
  for (var i = 0; i < validators.length; i++) {
    // Find accounts that are opted into the GARD price validator application
    // These accounts correspond to CDP opened on the GARD protocol
    const accounts = await searchAccountsAll({ appId: validators[i] })
    for (const account of accounts) {
      totalContractAlgo += (account['amount'] / Math.pow(10, 6))
      if (account['total-assets-opted-in'] == 1) {
        if (account['assets'][0]['asset-id'] == 793124631) {
          totalContractgAlgo += (account['assets'][0]['amount'] / Math.pow(10, 6))
        }
      }
    }
  }
  return (totalContractAlgo * price) + (totalContractgAlgo * gprice)
}

/* Get value locked in treasury */
async function getTreasuryBalUsd(price) {

  const info = await lookupAccountByID(treasuryAddress)
  const treasuryBal = info.account.amount;

  const v2Info = await lookupAccountByID(v2TreasuryAddress);
  const v2TreasuryBal = v2Info.account.assets?.find((asset) => asset["asset-id"] === gardId).amount;
  return ((treasuryBal * price) + v2TreasuryBal) / 1e6 // 1e6 comes from converting from microAlgos to Algos 
}

/* Get total deposits */
async function tvl() {
  const price = await getAlgoPrice();
  const gprice = await gAlgoPrice();

  const [treasuryBal, algoGovernanceDepositUsd] =
    await Promise.all([
      getTreasuryBalUsd(price),
      getAlgoGovernanceAccountBalsUsd(price, gprice),
    ]);

  return toUSDTBalances(treasuryBal + algoGovernanceDepositUsd);
}

/* Get total borrows */
async function borrowed() {

  const info = await lookupAccountByID(reserveAddress)
  const gardBalance = info.account.assets?.find((asset) => asset["asset-id"] === gardId).amount;

  const v2GardBalance = await getV2GardDebt()

  return ((188e16 - gardBalance) + v2GardBalance) / 1e6
}

async function borrowedBalances() {
  return toUSDTBalances(await borrowed())
}

async function treasuryBalances() {
  const price = await getAlgoPrice();
  return toUSDTBalances(await getTreasuryBalUsd(price))
}

// Converts USD to USDT
async function stakingBalances() {
  return toUSDTBalances(await getGARDStakedBalUSD())
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2022-10-06') / 1e3), 'Gard V2 mainnet launch'],
  ],
  algorand: {
    tvl,
    borrowed: borrowedBalances,
    treasury: treasuryBalances,
  }
}
