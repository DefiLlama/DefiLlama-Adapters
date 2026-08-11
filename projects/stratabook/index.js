const { sumTokens2 } = require('../helper/solana');
const { sleep } = require('../helper/utils');
const { Connection, PublicKey } = require('@solana/web3.js');

const CLOB_PROGRAM = 'strataZWURmW6bzMWpkLCAFxNFrQXCNSE9cSmBmdPgP'; // Stratabook CLOB (orderbook) program
const VAULT_PROGRAM = 'stRatA1NCyJ4LTQqzmH1aEJuFfA6V1cFgfctDPHy5Xb'; // Stratabook vault program (Hyperliquid-style, session keys)
const MARKET_DATA_SIZES = [384, 416]; // Market V2, V3 account sizes

// The shared DefiLlama RPC (api.mainnet-beta.solana.com) rate-limits
// getProgramAccounts/getTokenAccountsByOwner when many CI runs hit it at
// once. Retry patiently with capped backoff so a short 429 burst doesn't
// fail the whole TVL call. Other public endpoints block getProgramAccounts,
// so this is the only endpoint we use.
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

function makeConnection() {
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  return async function call(fn) {
    let lastErr;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        return await fn(connection);
      } catch (e) {
        lastErr = e;
        const msg = String(e.message) + ' ' + String(e);
        const isTransient = /429|500|502|503|504|Too Many|Gateway|ETIMEDOUT|ECONNRESET/.test(msg);
        if (!isTransient) throw e;
        await sleep(Math.min(500 * Math.pow(2, attempt), 4000));
      }
    }
    throw lastErr;
  };
}

const connectionCall = makeConnection();

async function tvl() {
  // Part A: CLOB market escrow vaults.
  // Market account layout (program-rust/src/state/market.rs):
  //   [0..8]   kind/bump/pad
  //   [8..40]  base_mint
  //   [40..72] quote_mint
  //   [72..104]  base_vault   <- escrow token account
  //   [104..136] quote_vault  <- escrow token account
  // dataSlice keeps the GPA response tiny (only the vault fields).
  const markets = [];
  for (const size of MARKET_DATA_SIZES) {
    const accounts = await connectionCall((conn) =>
      conn.getProgramAccounts(new PublicKey(CLOB_PROGRAM), {
        filters: [{ dataSize: size }],
        dataSlice: { offset: 72, length: 64 },
      })
    );
    markets.push(...accounts);
  }
  const tokenAccounts = markets
    .map(({ account }) => {
      const d = account.data;
      return [new PublicKey(d.subarray(0, 32)), new PublicKey(d.subarray(32, 64))];
    })
    .flat();

  // Part B: vault-program deposits. Vault PDAs are 24-byte accounts
  // (vault-account-rust/src/state.rs); user funds live in ATAs whose
  // owner field is the vault PDA, so enumerate those ATAs directly.
  const vaultPdAs = await connectionCall((conn) =>
    conn.getProgramAccounts(new PublicKey(VAULT_PROGRAM), {
      filters: [{ dataSize: 24 }],
    })
  );
  for (const { pubkey } of vaultPdAs) {
    // Vault ATAs may live under either the legacy SPL Token program or
    // Token-2022 (if a market mint is a Token-2022 token), so query both.
    // Sequential + small delay keeps rate limits happy.
    const legacy = await connectionCall((conn) =>
      conn.getTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      })
    );
    const token2022 = await connectionCall((conn) =>
      conn.getTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
      })
    );
    tokenAccounts.push(
      ...[...legacy.value, ...token2022.value].map(({ pubkey: p }) => p)
    );
    await sleep(150);
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
