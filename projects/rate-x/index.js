const { sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");
const { Program } = require('@project-serum/anchor');
const kaminoIdl = require('../kamino-lending/kamino-lending-idl.json');

async function getKusdcCollateralExchangeRate(connection) {
  const kaminoLendProgram = new Program(kaminoIdl, new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'), { connection, publicKey: PublicKey.unique() });
  const reserve = await kaminoLendProgram.account.reserve.fetch(new PublicKey('Ga4rZytCpq1unD4DbEJ5bkHeUz9g3oh9AAFEi6vSauXp'));
  const scaleFactor = Math.pow(2, 60);
  const totalSupply = reserve.liquidity.availableAmount.toNumber() + 
                      reserve.liquidity.borrowedAmountSf / scaleFactor - 
                      reserve.liquidity.accumulatedProtocolFeesSf / scaleFactor - 
                      reserve.liquidity.accumulatedReferrerFeesSf / scaleFactor - 
                      reserve.liquidity.pendingReferrerFeesSf / scaleFactor;
  const mintTotalSupply = reserve.collateral.mintTotalSupply;
  return totalSupply / mintTotalSupply;
}

async function tvl(api) {
  const connection = getConnection();
  const lookupTableAddress = new PublicKey("eP8LuPmLaF1wavSbaB4gbDAZ8vENqfWCL5KaJ2BRVyV");
 
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;

  const tokenAccounts = [];
  for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
    const address = lookupTableAccount.state.addresses[i];
    tokenAccounts.push(address.toBase58());
  }

  const res = await sumTokens2({
    tokenAccounts,
    balances: api.getBalances()
  });

  const resModified = {};

  for (let key in res) {
    if (key === 'solana:susdabGDNbhrnCa6ncrYo81u4s9GM8ecK2UwMyZiq4X') {
      // susd => tbill
      resModified['solana:4MmJVdwYN8LwvbGeCowYjSx7KoEi6BJWg8XXnW4fDDp6'] = res[key];
    } else if (key === 'solana:4tARAT4ssRYhrENCTxxZrmjL741eE2G23Q1zLPDW2ipf') {
      // lrtssol => ssol
      resModified['solana:sSo14endRuUbvQaJS3dq36Q829a3A6BEfoeeRGJywEh'] = res[key];
    } else if (key === 'solana:32XLsweyeQwWgLKRVAzS72nxHGU1JmmNQQZ3C3q6fBjJ') {
      // kusdc => usdc
      const kUsdcRate = await getKusdcCollateralExchangeRate(connection);
      resModified['solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'] = Math.floor(Number(res[key]) * kUsdcRate).toString();
    } else {
      resModified[key] = res[key];
    }
  }

  return resModified;
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the value of the traders' vault, LP vault, and earn vault.",
  solana: { tvl },
};
