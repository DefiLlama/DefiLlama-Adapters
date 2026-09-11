const { sumTokens2, getConnection } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

const CLOB_PROGRAM = 'strataZWURmW6bzMWpkLCAFxNFrQXCNSE9cSmBmdPgP'; // Stratabook CLOB (orderbook) program
const VAULT_PROGRAM = 'stRatA1NCyJ4LTQqzmH1aEJuFfA6V1cFgfctDPHy5Xb'; // Stratabook vault program (Hyperliquid-style, session keys)
const MARKET_DATA_SIZES = [384, 416]; // Market V2, V3 account sizes

const TOKEN = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

async function tvl(api) {
  const connection = getConnection();
  const tokenAccounts = [];

  // CLOB market escrow vaults (base_vault + quote_vault)
  for (const size of MARKET_DATA_SIZES) {
    const accounts = await connection.getProgramAccounts(new PublicKey(CLOB_PROGRAM), {
      filters: [{ dataSize: size }],
      dataSlice: { offset: 72, length: 64 },
    });
    for (const { account } of accounts)
      tokenAccounts.push(new PublicKey(account.data.subarray(0, 32)), new PublicKey(account.data.subarray(32, 64)));
  }

  // vault-program PDAs' token accounts
  const vaultPdas = await connection.getProgramAccounts(new PublicKey(VAULT_PROGRAM), { filters: [{ dataSize: 24 }] });
  const results = await Promise.all(vaultPdas.flatMap(({ pubkey }) => [
    connection.getTokenAccountsByOwner(pubkey, { programId: TOKEN }),
    connection.getTokenAccountsByOwner(pubkey, { programId: TOKEN_2022 }),
  ]));
  for (const { value } of results) tokenAccounts.push(...value.map(({ pubkey }) => pubkey));

  return sumTokens2({ api, tokenAccounts });
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL = user funds held in Stratabook contracts on Solana: ' +
    '(A) CLOB market escrow vaults (open orders + resting liquidity across all markets) ' +
    'and (B) user vault deposits (Hyperliquid-style vault program, session-key trading). ' +
    'Excludes ProtocolVault (protocol-owned captured fees) and referral payouts.',
  solana: { tvl },
};
