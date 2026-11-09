// Zilliqa JSON-RPC transport lives in @defillama/sdk (`sdk.chains.zilliqa`, `ZILLIQA_NATIVE_RPC` overrides the endpoint);
// this file keeps the TVL helpers (ZRC-2 balances, native ZIL).
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

const zilliqa = sdk.chains.zilliqa

// ZRC-2 balances of every token for every address, summed into `balances` under `zilliqa:<token>` in raw units
// (decimals/pricing come from the coins server token mapping)
async function getBalances(tokens, addresses, balances = {}) {
  if (!Array.isArray(tokens)) tokens = [tokens]
  if (!Array.isArray(addresses)) addresses = [addresses]

  const res = await zilliqa.getTokenBalances({ tokens, addresses })

  for (const [token, holders] of Object.entries(res)) {
    const raw = Object.values(holders).reduce((acc, i) => acc.plus(i), BigNumber(0))
    if (raw.isZero()) continue
    sdk.util.sumSingleBalance(balances, `zilliqa:${token}`, raw.toFixed(0))
  }

  return balances
}

// native ZIL of `owners`, in whole ZIL
async function sumTokens({ owners, }) {
  const balances = await Promise.all(owners.map((owner) => zilliqa.getBalance({ address: owner })))
  return {
    zilliqa: balances.reduce((a, i) => a + zilliqa.qaToZil(i), 0),
  }
}

module.exports = {
  getBalances,
  sumTokens,
}
