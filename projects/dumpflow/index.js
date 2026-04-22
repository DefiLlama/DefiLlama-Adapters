const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

// dump_contract — Dumpfun's bonding-curve token launchpad ("DumpFlow").
// Each launched token has a LiquidityPool PDA holding pool state and a
// liquidity_pool_authority PDA (system-owned) that holds the SOL reserve
// backing the bonding curve. TVL sums SOL across all authority PDAs.
const PROGRAM_ID = new PublicKey("DumpFunGAgW6kPHzWMA3Nnqecyrd6SGnLZvNGp2aHwEa");

// Anchor discriminator: sha256("account:LiquidityPool")[0:8]
const DISC_LIQUIDITY_POOL = Buffer.from([66, 38, 17, 64, 188, 80, 68, 129]);
const SIZE_LIQUIDITY_POOL = 254;

// LiquidityPool layout (see programs/dump_contract/src/states.rs):
// 8 disc | 32 creator | 32 platform_fee | 32 company_tax | 32 mint | ...
const MINT_OFFSET = 8 + 32 + 32 + 32;
const AUTHORITY_SEED = Buffer.from("authority");

async function tvl(api) {
  const connection = getConnection();

  const pools = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: DISC_LIQUIDITY_POOL.toString("base64"), encoding: "base64" } },
      { dataSize: SIZE_LIQUIDITY_POOL },
    ],
    dataSlice: { offset: MINT_OFFSET, length: 32 },
  });

  const solOwners = pools.map(({ pubkey, account }) => {
    const mint = new PublicKey(account.data);
    const [authority] = PublicKey.findProgramAddressSync(
      [pubkey.toBuffer(), mint.toBuffer(), AUTHORITY_SEED],
      PROGRAM_ID,
    );
    return authority.toBase58();
  });

  await sumTokens2({ api, solOwners });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts native SOL held by the bonding-curve reserve PDA " +
    "(liquidity_pool_authority) of every LiquidityPool launched through " +
    "the DumpFlow program. Pools are discovered dynamically via " +
    "getProgramAccounts, and each pool's authority PDA is derived from " +
    "seeds [liquidity_pool, mint, 'authority']. Platform fees (1% of SOL " +
    "volume) and company tax are routed to separate wallets and are NOT " +
    "included in TVL.",
  solana: { tvl },
};
