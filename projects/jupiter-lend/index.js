const { getConfig } = require('../helper/cache')
const { getProvider, sumTokens2 } = require('../helper/solana')
const { Program } = require("@coral-xyz/anchor");

async function getData() {
  const LIQUIDITY_IDL_URL = "https://raw.githubusercontent.com/jup-ag/jupiter-lend/refs/heads/main/target/idl/liquidity.json";
  const LIQUIDITY_PROGRAM_ID = "jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC";

  const idl = await getConfig('jupiter-lend', LIQUIDITY_IDL_URL)
  const provider = getProvider();
  idl.metadata.address = LIQUIDITY_PROGRAM_ID;
  const program = new Program(idl, provider);
  return ( await program.account.tokenReserve.all()).map(i => i.account)
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