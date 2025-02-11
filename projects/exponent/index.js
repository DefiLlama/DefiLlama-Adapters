const { getConnection, getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@coral-xyz/anchor");

const { getConfig } = require('../helper/cache')
const idl = require('./idl.json')


async function tvl(api) {
  const provider = getProvider()
  const connection = getConnection()
  
  const program = new Program(idl, provider)
  const vaults = await program.account.vault.all()
  
  const mintRateMap = {}
  const mintAccountMap = {}
  
  vaults.forEach(v => {
    const rate = v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12
    if (rate > 0)
      mintRateMap[v.account.mintSy.toString()] = v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12
  })

  // Fetch mint accounts
  const mintPubkeys = Object.keys(mintRateMap).map(k => new PublicKey(k))
  const mintAccounts = await connection.getMultipleAccountsInfo(mintPubkeys);


  mintAccounts.forEach((a, i) => {
    mintAccountMap[mintPubkeys[i].toString()] = a
  })
  
  // Fetch Exponent wrapped mints from Exponent API
  const { data: mints } = await getConfig('exponent', 'https://xpon-json-api-prod-650968662509.europe-west3.run.app/api/lyt-growth/standard-yield-tokens');
  

  for (let i = 0; i < mints.length; i++) {
    const { mintSy, mintUnderlying} = mints[i]
    const mintAccount = mintAccountMap[mintSy]
    const mintRate = mintRateMap[mintSy]
    if (!mintAccount || !mintRate) continue;

    // Decode mint data
    const decodedMint = decodeAccount('mint', mintAccount);
    const supply = decodedMint.supply;

    // As all of the Exponent wrapped tokens are yield bearing tokens, mutiply their supply by their redemption rate to get the base asset amount
    const amount = supply * mintRate;

    // Add to balances using the base asset price * the converted amount of base tokens
    api.add(mintUnderlying, amount);
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the total supply of each Exponent wrapped Yield bearing token and multiplying their base asset amount by the price of the underlying token",
  solana: { tvl },
};

