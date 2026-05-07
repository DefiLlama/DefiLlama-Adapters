const { sumTokens} = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");
const plimit = require("p-limit");
const { call } = require('../helper/chain/ton');
const { sleep } = require('../helper/utils');

const syEvaaMinter = "EQDi9blCcyT-k8iMpFMYY0t7mHVyiCB50ZsRgyUECJDuGvIl" // Evaa USDT (maturity 2025-06-01)

// i2 pools
const tsTON01Sep2025 = "EQAPICp-A_2QNEb7xiBwAoeypEnhrtY5tJ_1vGGujjVvflTl"
const USDTSlpSyMinter01Sep2025 = "EQDLqPppdVfv4bVqV6bpCYwmDUVCsem2LV5zda3fMIKgCxkH"
const TONSlpSyMinter01Sep2025 = "EQBeLuWFjniPGnAyy7gVKJkA1mXptxP-dgBswKIY5su6NHFd"
const USDe01Sep2025 = "EQDafE9flDXaRCnhrprgPj_sJNJb502Dov1GDruIRjarHscs"
const tsUSDe01Sep2025 = "EQC57U5O4_OGLSEgX498PpmNqSYzcXx63wvOdtkCoe5LHcfo"

const syEvaaMinter01Sep2025 = "EQBY5JE96x_U5fSSsAzBj8d-_ZbK-5AihJ2rzjTZAtNqsntL"

// Torch stgUSD contracts
const stgUSDWallet01Sep2025 = "EQB7mAJdOoatcYNB6dXL722-you09EjGIMEV3nUIN9WQ5jq7"
const ytStgUSD01Sep2025 = "EQBZU_ZFAl8_nACqkJ_Gl6fKEyAJ0uNiMc2borzmrF2KM_Bp"

// i3 pools
const tsTON18Dec2025 = "EQBoiugW7Q6X4r6hEfN-r-9ZI8Fmc3s9qRGysPeP-CEjdp9P"
const USDTSlpSyMinter18Dec2025 = "EQBbmjEHGkEDofbig93IAOE-aiQ_4caa1fVcn97GBjfNzV-Z"
const TONSlpSyMinter18Dec2025 = "EQBrHC-Fhg9_YupfujOuC2OTeVkkDrgpyHM63gfBdqYYe_pt"
const USDe18Dec2025 = "EQA8xzTSbgG8yMGPAC4te9c9YrezJ3X3vQ6dxhodXU0KIWeH"
const tsUSDe18Dec2025 = "EQBxUy6vYBo3zb0v1XvJP2kePQQ7D2447i5EymEdvyTAJlVi"

// const syEvaaMinter18Dec2025 = "" // will be deployed after EVVA update

// Torch stgUSD contracts
const stgUSDWallet18Dec2025 = "EQDNpKHypIEdGafseDPOJSFfG7d3ykd9X6dDd6fRvu5mIC6a"
const ytStgUSD18Dec2025 = "EQDNmcwxpWdjMV6yLQOTZWPJGJWeWlPWhHz-esDgB2OhXnka"

const indexPrecision = 10 ** 6

const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const rateLimitedCall = rateLimited(call);

async function getSuppliedToEVAAJettons(api, evaaSyMinters) {
  // Handle both single address and array of addresses
  const minters = Array.isArray(evaaSyMinters) ? evaaSyMinters : [evaaSyMinters];
  
  let totalAdjustedUSDT = 0;
  
  for (const evaaSyMinter of minters) {
    const suppliedUSDTToEvaa = await rateLimitedCall({
      target: evaaSyMinter,
      abi: 'get_total_evaa_supplied',
      params: []
    });

    await sleep(1000 * (2 * Math.random() + 3)); // 3-5 second delay

    const indexData = await rateLimitedCall({
      target: evaaSyMinter,
      abi: 'get_index',
      params: []
    });

    const adjustedUSDT = suppliedUSDTToEvaa * indexData[0] / 10 ** 3 / indexPrecision;
    totalAdjustedUSDT += adjustedUSDT;
    
    // Add additional delay between different addresses
    if (minters.length > 1) {
      await sleep(1000 * (Math.random() + 2)); // Additional 2-3 seconds
    }
  }
  api.add(ADDRESSES.ton.USDT, totalAdjustedUSDT);
}

async function getTorchStgUSD(api, stgUSDWallet, ytStgUSD) {
  // Get stgUSD balance from the smart contract wallet
  const stgUSDBalance = await rateLimitedCall({
    target: stgUSDWallet,
    abi: 'get_wallet_data',
    params: []
  });

  await sleep(1000 * (2 * Math.random() + 3)); // 3-5 second delay

  // Get index from YT contract
  const indexData = await rateLimitedCall({
    target: ytStgUSD,
    abi: 'get_index',
    params: []
  });

  // Convert stgUSD to USDT using the provided formula
  const adjustedUSDT = stgUSDBalance[0] * indexData[0] / indexPrecision;
  
  api.add(ADDRESSES.ton.USDT, adjustedUSDT);
}

async function tvl(api) {
  // balances in the SY minter smart contracts
  await sumTokens({
    api,
    owners: [
      USDTSlpSyMinter01Sep2025,
      TONSlpSyMinter01Sep2025,
      USDe01Sep2025,
      tsUSDe01Sep2025,
      tsTON01Sep2025,
      tsTON18Dec2025,
      USDTSlpSyMinter18Dec2025,
      TONSlpSyMinter18Dec2025,
      USDe18Dec2025,
      tsUSDe18Dec2025
    ],
    tokens: [ADDRESSES.null],
  })

  // Evaa tvl - balance in the EVVA protocol supplied by SY minter smartcontract
  await getSuppliedToEVAAJettons(api, [syEvaaMinter, syEvaaMinter01Sep2025]);

  // // Get Torch StgUSD balance
  await getTorchStgUSD(api, stgUSDWallet01Sep2025, ytStgUSD01Sep2025);
  await getTorchStgUSD(api, stgUSDWallet18Dec2025, ytStgUSD18Dec2025);
}

module.exports = {
  methodology: 'Counts FIVA smartcontract balance as TVL. EVAA USDT: Counts amount of USDT supplied to EVAA protocol by SY minter smartcontract.',
  ton: {
    tvl
  }
}
