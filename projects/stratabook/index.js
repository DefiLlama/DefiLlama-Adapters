const { sumTokens2, getConnection } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

const CLOB_PROGRAM = 'strataZWURmW6bzMWpkLCAFxNFrQXCNSE9cSmBmdPgP'; // Stratabook CLOB (orderbook) program
const VAULT_PROGRAM = 'stRatA1NCyJ4LTQqzmH1aEJuFfA6V1cFgfctDPHy5Xb'; // Stratabook vault program (Hyperliquid-style, session keys)
const MARKET_DATA_SIZES = [384, 416]; // Market V2, V3 account sizes

async function tvl() {
  const connection = getConnection();

  // Part A: CLOB market escrow vaults.
  // Market account layout (program-rust/src/state/market.rs):
  //   [0..8]   kind/bump/pad
  //   [8..40]  base_mint
  //   [40..72] quote_mint
  //   [72..104]  base_vault   <- escrow token account
  //   [104..136] quote_vault  <- escrow token account
  const markets = [];
  for (const size of MARKET_DATA_SIZES) {
    const accounts = await connection.getProgramAccounts(new PublicKey(CLOB_PROGRAM), {
      filters: [{ dataSize: size }],
    });
    markets.push(...accounts);
  }
  const tokenAccounts = markets
    .map(({ account }) => {
      const d = account.data;
      return [new PublicKey(d.subarray(72, 104)), new PublicKey(d.subarray(104, 136))];
    })
    .flat();

  // Part B: vault-program deposits. Vault PDAs are 24-byte accounts
  // (vault-account-rust/src/state.rs); user funds live in ATAs whose
  // owner field is the vault PDA, so enumerate those ATAs directly.
  const vaultPdAs = await connection.getProgramAccounts(new PublicKey(VAULT_PROGRAM), {
    filters: [{ dataSize: 24 }],
  });
  for (const { pubkey } of vaultPdAs) {
    const { value: tokenAccountsOfVault } = await connection.getTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });
    tokenAccounts.push(...tokenAccountsOfVault.map(({ pubkey: p }) => p));
  }

  return sumTokens2({ tokenAccounts });
}

module.exports = {
  timetravel: false, // GPA discovers live accounts — no historical backfill
  misrepresentedTokens: false,
  methodology:
    'TVL = user funds held in Stratabook contracts on Solana: ' +
    '(A) CLOB market escrow vaults (open orders + resting liquidity across all markets) ' +
    'and (B) user vault deposits (Hyperliquid-style vault program, session-key trading). ' +
    'Excludes ProtocolVault (protocol-owned captured fees) and referral payouts.',
  solana: { tvl },
};
