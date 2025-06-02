const { sumTokens} = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");
const plimit = require("p-limit");
const { call } = require('../helper/chain/ton');
const { sleep } = require('../helper/utils');

const tsTON6mSyMinter = "EQAxGi9Al7hamLAORroxGkvfap6knGyzI50ThkP3CLPLTtOZ"
const USDTSlpSyMinter = "EQA0Pobx0rXc7MlfXvUAZlC_U4MRGJ4FKGq79dHbBJ7RsuyB"
const NOTSlpSyMinter = "EQD5A2ygwSgAXXTqI-OkAOY72bXn8-mRgE9wOEFLKgu6ifbD"
const TONSlpSyMinter = "EQB9nQdgwdaTXG6F7mDEErPuuJza6lmCfQjun-PXK3iJXm2h"

const syEvaaMinter = "EQDi9blCcyT-k8iMpFMYY0t7mHVyiCB50ZsRgyUECJDuGvIl" // Evaa USDT (maturity 2025-06-01)

// i2 pools
const USDTSlpSyMinter01Sep2025 = "EQDLqPppdVfv4bVqV6bpCYwmDUVCsem2LV5zda3fMIKgCxkH"
const TONSlpSyMinter01Sep2025 = "EQBeLuWFjniPGnAyy7gVKJkA1mXptxP-dgBswKIY5su6NHFd"
const USDe01Sep2025 = "EQDafE9flDXaRCnhrprgPj_sJNJb502Dov1GDruIRjarHscs"
const tsUSDe01Sep2025 = "EQC57U5O4_OGLSEgX498PpmNqSYzcXx63wvOdtkCoe5LHcfo"

const syEvaaMinter01Sep2025 = "EQBY5JE96x_U5fSSsAzBj8d-_ZbK-5AihJ2rzjTZAtNqsntL"

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

async function tvl(api) {
  // balances in the SY minter smart contracts
  await sumTokens({
    api,
    owners: [
      tsTON6mSyMinter, USDTSlpSyMinter, NOTSlpSyMinter, TONSlpSyMinter,
      USDTSlpSyMinter01Sep2025,
      TONSlpSyMinter01Sep2025,
      USDe01Sep2025,
      tsUSDe01Sep2025,
    ],
    tokens: [ADDRESSES.null],
  })

  // Evaa tvl - balance in the EVVA protocol supplied by SY minter smartcontract
  await getSuppliedToEVAAJettons(api, [syEvaaMinter, syEvaaMinter01Sep2025]);
}

module.exports = {
  methodology: 'Counts FIVA smartcontract balance as TVL. evaa USDT: Counts amount of USDT supplied to EVAA protocol by SY minter smartcontract.',
  ton: {
    tvl
  }
}
