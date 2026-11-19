const { default: BigNumber } = require("bignumber.js")
const sdk = require('@defillama/sdk')

const near = sdk.chains.near

// balance keys: rainbow-bridged tokens map to their ethereum contract, everything else is `near:<account>`
// (decimals/pricing come from the coins server token mapping); keys that already carry a chain prefix are left alone
function transformAddress(addr) {
  if (addr.includes(':')) return addr
  const bridgedAssetIdentifier = ".factory.bridge.near";
  if (addr.endsWith(bridgedAssetIdentifier))
    return `0x${addr.slice(0, addr.length - bridgedAssetIdentifier.length)}`;
  return `near:${addr}`
}

async function view_account(account_id) {
  return near.viewAccount({ account: account_id })
}

function isUnknownAccountError(e) {
  const str = `${e?.cause ?? ''} ${e?.errorName ?? ''} ${e?.nodeError?.cause?.name ?? ''} ${e?.message ?? ''}`
  return /UNKNOWN_ACCOUNT|does not exist/i.test(str)
}

// like view_account, but an account that does not exist on-chain yet (never funded) yields a zero balance instead of throwing
async function view_account_or_empty(account_id) {
  try {
    return await view_account(account_id)
  } catch (e) {
    if (!isUnknownAccountError(e)) throw e
    console.log(`[near] account ${account_id} not found on-chain, skipping`)
    return { amount: '0', locked: '0' }
  }
}

// view call, `args` are JSON serialised; the reply is JSON parsed
async function call(contract, method, args = {}) {
  return near.call({ contract, method, args })
}

// `ft_balance_of` raw balance; 0 when the token contract does not exist
async function getTokenBalance(token, account) {
  return near.getTokenBalance({ token, account })
}

async function addTokenBalances(tokens, account, balances = {}) {
  if (!Array.isArray(tokens)) tokens = [tokens]
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: tokens,
    processor: token => addAsset(token, account, balances),
  })
  return balances
}

async function addAsset(token, account, balances = {}) {
  let balance = await getTokenBalance(token, account)
  return sumSingleBalance(balances, token, balance)
}

// `balance` is the raw (undivided) token amount
function sumSingleBalance(balances, token, balance) {
  sdk.util.sumSingleBalance(balances, transformAddress(token), BigNumber(balance).toFixed(0))
  return balances
}

async function sumTokens({ balances = {}, owners = [], tokens = []}) {
  tokens = tokens.filter(i => i !== 'aurora')
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: owners,
    processor: i => addTokenBalances(tokens, i, balances),
  })
  const bals = []
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: owners,
    processor: async i => bals.push(await view_account_or_empty(i)),
  })
  const nearBalance = bals.reduce((a,i) => a + (i.amount/1e24), 0)
  sdk.util.sumSingleBalance(balances,'coingecko:near',nearBalance)
  return balances
}

module.exports = {
  view_account,
  call,
  addTokenBalances,
  getTokenBalance,
  sumSingleBalance,
  sumTokens,
};
