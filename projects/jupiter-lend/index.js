const { getConfig } = require('../helper/cache')
const { getProvider, sumTokens2, getTokenAccountBalances } = require('../helper/solana')
const { Program } = require("@coral-xyz/anchor");

const LIQUIDITY_IDL_URL = "https://raw.githubusercontent.com/jup-ag/jupiter-lend/refs/heads/main/target/idl/liquidity.json";
const LIQUIDITY_PROGRAM_IDS = [
  "jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC", // main deployment
  "jup6QF1sNDGpkkcu6F4qaFHcRBmnSS1VgyB4uFbBvNS", // isolated Ethena market (shares the liquidity IDL)
];

async function getData() {
  const idl = await getConfig('jupiter-lend', LIQUIDITY_IDL_URL)
  const provider = getProvider();
  const reserves = []
  for (const programId of LIQUIDITY_PROGRAM_IDS) {
    const localIdl = { ...idl, address: programId }
    const program = new Program(localIdl, provider);
    const accounts = await program.account.tokenReserve.all()
    reserves.push(...accounts.map(i => i.account))
  }
  return reserves
}

const EXCHANGE_PRICE_PRECISION = 1e12
// aTokens held by ethena's wallet, mapped to the underlying mint — subtracted since
// these deposits are already counted in ethena's TVL
const ETHENA_ATOKEN_ACCOUNTS = {
  '6ZaKSZfYLUvbWqDmHKWWZ7wtUo8aMidvE6k8U2oMXvjf': '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH', // jUSDG -> USDG
}
async function tvl(api) {
  const tokenReserves = await getData();
  const tokenAccounts = tokenReserves.map(i => i.vault.toBase58())
  await sumTokens2({ api, tokenAccounts })
  const reserveByMint = {}
  tokenReserves.forEach(r => { reserveByMint[r.mint.toBase58()] = r })
  const accounts = Object.keys(ETHENA_ATOKEN_ACCOUNTS)
  const balances = await getTokenAccountBalances(accounts, { individual: true, allowError: true })
  balances.forEach((b, i) => {
    const underlyingMint = ETHENA_ATOKEN_ACCOUNTS[accounts[i]]
    const reserve = reserveByMint[underlyingMint]
    const underlying = +b.amount * (+reserve.supplyExchangePrice.toString()) / EXCHANGE_PRICE_PRECISION
    api.add(underlyingMint, -underlying)
  })
}
async function borrowed(api) {
  const tokenReserves = await getData()
  tokenReserves.forEach(i => {
    const totalBorrowed = (+i.totalBorrowWithInterest.toString() * +i.borrowExchangePrice.toString() / EXCHANGE_PRICE_PRECISION) + +i.totalBorrowInterestFree.toString()
    api.add(i.mint.toBase58(), totalBorrowed)
  })
}

module.exports = {
  solana: { tvl, borrowed, },
}
