const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = "BV1RxkAaD5DjXMsnofkVikFUUYdrDg1v8YgsQ3iyDNoL";
const PIGEON_MINT = "4fSWEw2wbYEUCcMtitzmeGUfqinoafXxkhqZrA9Gpump";
const BONDING_CURVE_DISCRIMINATOR = "4y6pru6YvC7"; // sha256("account:BondingCurve")[0:8] -> base58

async function getActiveCurves() {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
    filters: [{ memcmp: { offset: 0, bytes: BONDING_CURVE_DISCRIMINATOR } }],
  });

  const tvlTokensAndOwners = [];
  const stakingTokensAndOwners = [];

  for (const { pubkey, account } of accounts) {
    const data = account.data;

    // BondingCurve layout (408 bytes, with quote_mint):
    //   [0..8]    discriminator
    //   [8..40]   token_mint (Pubkey)
    //   [40..72]  creator (Pubkey)
    //   [72..104] quote_mint (Pubkey)
    //   [104..112] virtual_pigeon_reserves (u64)
    //   [112..120] virtual_token_reserves (u64)
    //   [120..128] real_pigeon_reserves (u64)
    //   [128..136] real_token_reserves (u64)
    //   [136..144] token_total_supply (u64)
    //   [144]      complete (bool) <-- graduation flag

    // Detect layout version (408 = new with quote_mint, 376 = old without)
    const hasQuoteMint = data.length >= 408;
    const quoteMint = hasQuoteMint
      ? new PublicKey(data.subarray(72, 104))
      : new PublicKey(PIGEON_MINT);

    // Skip graduated curves (liquidity migrated to Raydium)
    const completeOffset = hasQuoteMint ? 144 : 112;
    if (completeOffset < data.length && data[completeOffset] === 1) continue;

    const mint = quoteMint.toBase58();
    const owner = pubkey.toBase58();
    if (mint === PIGEON_MINT) {
      stakingTokensAndOwners.push([mint, owner]);
    } else {
      tvlTokensAndOwners.push([mint, owner]);
    }
  }

  return { tvlTokensAndOwners, stakingTokensAndOwners };
}

async function tvl() {
  const { tvlTokensAndOwners } = await getActiveCurves();
  return sumTokens2({ tokensAndOwners: tvlTokensAndOwners });
}

async function staking() {
  const { stakingTokensAndOwners } = await getActiveCurves();
  return sumTokens2({ tokensAndOwners: stakingTokensAndOwners });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking,
  },
  methodology:
    "TVL counts non-PIGEON reserves (SOL, SKR) in active bonding curves. Staking counts PIGEON reserves. Graduated curves are excluded.",
};