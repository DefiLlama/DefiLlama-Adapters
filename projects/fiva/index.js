const { sumTokens} = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");
const plimit = require("p-limit");
const { call } = require('../helper/chain/ton');

const tsTON6mSyMinter = "EQAxGi9Al7hamLAORroxGkvfap6knGyzI50ThkP3CLPLTtOZ"
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
  // tsTON tvl - balance in the SY minter smartcontract
  await sumTokens({api, owners: [tsTON6mSyMinter], tokens: [ADDRESSES.null]})

  // Evaa tvl - balance in the EVVA protocol sypplied by SY minter smartcontract
  await getEVAASuppliedUSDT(api, syEvaaMinter);

}

module.exports = {
  methodology: 'tsTON: Counts FIVA smartcontract balance as TVL. USDT: Counts amount of USDT supplied to EVAA protocol by SY minter smartcontract.',
  ton: {
    tvl
  }
}
