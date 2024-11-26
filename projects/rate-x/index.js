const { sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

async function tvl(api) {
  const connection = getConnection();
  const lookupTableAddress = new PublicKey("eP8LuPmLaF1wavSbaB4gbDAZ8vENqfWCL5KaJ2BRVyV");
 
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;

  const tokenAccounts = []
  for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
    const address = lookupTableAccount.state.addresses[i];
    tokenAccounts.push(address.toBase58());
  }

  return sumTokens2({
    tokenAccounts,
    balances: api.getBalances()
  })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the value of the traders' vault, LP vault, and earn vault.",
  solana: { tvl },
};
