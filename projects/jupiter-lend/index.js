const { getConfig } = require('../helper/cache')
const { getProvider, sumTokens2 } = require('../helper/solana')
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
async function tvl() {
  const tokenReserves = await getData();
  const tokenAccounts = tokenReserves.map(i => i.vault.toBase58())
  return sumTokens2({ tokenAccounts })
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
