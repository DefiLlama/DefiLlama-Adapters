const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { get } = require('../helper/http')

async function tvl(api) {
  const connection = getConnection();

  // Fetch Exponent wrapped mints from Exponent API
  const { data: mints } = await get('https://xpon-json-api-prod-650968662509.europe-west3.run.app/api/lyt-growth/standard-yield-tokens');

  // Fetch mint accounts
  const mintPubkeys = mints.map(m => new PublicKey(m.mintSy));
  const mintAccounts = await connection.getMultipleAccountsInfo(mintPubkeys);

  for (let i = 0; i < mints.length; i++) {
    const mint = mints[i];
    const mintAccount = mintAccounts[i];

    if (!mintAccount) continue;

    // Decode mint data
    const decodedMint = decodeAccount('mint', mintAccount);
    const supply = decodedMint.supply;

    // As all of the Exponent wrapped tokens are yield bearing tokens, mutiply their supply by their redemption rate to get the base asset amount
    const amount = supply * mint.price;

    // Add to balances using the base asset price * the converted amount of base tokens
    api.add(mint.mintUnderlying, amount);
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the total supply of each Exponent wrapped Yield bearing token and multiplying their base asset amount by the price of the underlying token",
  solana: { tvl },
};