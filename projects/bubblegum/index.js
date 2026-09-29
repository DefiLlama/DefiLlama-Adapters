const { getProvider, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58").default || require("bs58");

// Bubblegum — pump.fun-style launchpad for prediction markets on Solana.
// Two programs, two axes of state:
//   - curve: a bonding curve per market that mints $TICKER and escrows BUYER SOL
//   - cpmm:  a YES/NO prediction market whose COLLATERAL IS $TICKER (not SOL)
//
// The only REAL external asset that enters the system is the SOL paid into the
// bonding curves. $TICKER is a protocol-minted token whose sole backing/price
// is that same curve SOL, so counting $TICKER balances (in the curve token
// vault or as CPMM collateral) would be circular double-counting. We therefore
// count ONLY the native SOL escrowed in pre-graduation curves.
//
// Live mainnet curve program: the `declare_id!` baked into the deployed contract
// (contracts/curve/programs/bubblegum-curve/src/lib.rs), matched by the production
// indexer config and the .env.mainnet templates, and confirmed on-chain (it holds
// the live BondingCurve accounts).
// NOTE: the repo's addresses/mainnet.json registry and the npm SDK are STALE here —
// they still list a superseded first-deploy program (6eLrwpk…) that holds zero markets.
const CURVE_PROGRAM = new PublicKey("71ywu6cFWETLyiz1KcuMwq2wfguYfra7b1bCPinVqKm3");

// Anchor 8-byte account discriminator for the `BondingCurve` account.
const BONDING_CURVE_DISCRIMINATOR = Buffer.from([23, 183, 248, 55, 96, 216, 172, 96]);

// Byte offsets inside BondingCurve account data (Borsh, fixed-size prefix).
// Layout: 8 disc | 32 condition_id | 8 nonce | 32 creator | 32 ticker_mint |
//         32 token_vault | 32 sol_vault | 32 cpmm_market | 8 real_sol_collected | ...
const OFFSET_SOL_VAULT = 144; // pubkey(32): native-SOL escrow PDA for this curve
const OFFSET_STATUS = 248;    // u8 enum CurveStatus: 0=Active 1=GraduationPending 2=Graduated

async function tvl(api) {
  const conn = getProvider().connection;

  // Fetch every BondingCurve account (discriminator filter keeps it to this one
  // account type). We read each curve's status + its sol_vault PDA address.
  const accounts = await conn.getProgramAccounts(CURVE_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(BONDING_CURVE_DISCRIMINATOR) } }],
  });

  const solVaults = [];
  for (const { account } of accounts) {
    const data = account.data;
    const status = data[OFFSET_STATUS];
    // status 2 (Graduated) => the 75 SOL has migrated to a Meteora DAMM v2 pool
    // and is counted by Meteora's own adapter; only pre-graduation curves still
    // escrow SOL here. Keep Active (0) and GraduationPending (1).
    if (status !== 0 && status !== 1) continue;
    solVaults.push(new PublicKey(data.slice(OFFSET_SOL_VAULT, OFFSET_SOL_VAULT + 32)).toBase58());
  }

  // Sum native SOL held by each escrow PDA. sumTokens2 prices it as SOL.
  return sumTokens2({ api, solOwners: solVaults });
}

module.exports = {
  timetravel: false, // state-based: getProgramAccounts only reflects the current slot
  methodology:
    "TVL is the native SOL escrowed in pre-graduation bonding curves. The curve program (71ywu6cFWETLyiz1KcuMwq2wfguYfra7b1bCPinVqKm3) holds one BondingCurve per market; we enumerate them and sum the lamports held by each curve's sol_vault escrow PDA for curves in Active or GraduationPending status. Excluded to avoid circular double-counting: the curve's virtual reserves (a pricing device, not real assets), the protocol-minted $TICKER in the curve token vault and the paired CPMM (whose collateral IS $TICKER, backed by the very SOL already counted here), and graduated markets (their 75 SOL has migrated to a Meteora DAMM v2 pool and is counted by Meteora's adapter).",
  solana: {
    tvl,
  },
};
