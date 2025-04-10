const { sumTokens} = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");
const plimit = require("p-limit");
const { call } = require('../helper/chain/ton');

const tsTON6mSyMinter = "EQAxGi9Al7hamLAORroxGkvfap6knGyzI50ThkP3CLPLTtOZ"
const USDTSlpSyMinter = "EQA0Pobx0rXc7MlfXvUAZlC_U4MRGJ4FKGq79dHbBJ7RsuyB"
const NOTSlpSyMinter = "EQD5A2ygwSgAXXTqI-OkAOY72bXn8-mRgE9wOEFLKgu6ifbD"
const TONSlpSyMinter = "EQB9nQdgwdaTXG6F7mDEErPuuJza6lmCfQjun-PXK3iJXm2h"


const syEvaaMinter = "EQDi9blCcyT-k8iMpFMYY0t7mHVyiCB50ZsRgyUECJDuGvIl" // Evaa USDT (maturity 2025-06-01)

const indexPrecision = 10 ** 6

const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getEVAASuppliedUSDT = rateLimited(getSuppliedToEVAAJettons);

async function getSuppliedToEVAAJettons(api, evaaSyMinter) {
  const suppliedUSDTToEvaa = await call({
    target: evaaSyMinter,
    abi: 'get_total_evaa_supplied',
    params: []
  });

  const indexData = await call({
    target: evaaSyMinter,
    abi: 'get_index',
    params: []
  });

  const adjustedUSDT = suppliedUSDTToEvaa * indexData[0] / 10 ** 3 / indexPrecision;

  api.add(ADDRESSES.ton.USDT, adjustedUSDT);
}

async function tvl(api) {
  // balances in the SY minter smart contracts
  await sumTokens({
    api,
    owners: [tsTON6mSyMinter, USDTSlpSyMinter, NOTSlpSyMinter, TONSlpSyMinter],
    tokens: [ADDRESSES.null],
  })

  // Evaa tvl - balance in the EVVA protocol supplied by SY minter smartcontract
  await getEVAASuppliedUSDT(api, syEvaaMinter);

}

module.exports = {
  methodology: 'Counts FIVA smartcontract balance as TVL. evaa USDT: Counts amount of USDT supplied to EVAA protocol by SY minter smartcontract.',
  ton: {
    tvl
  }
}
