const { queryAllium } = require("../helper/allium");

async function tvl(api) {
  const endTimestamp = api.timestamp;
  const startTimestamp = endTimestamp - (86400 * 30 * 365);

  // Uncomment this query while backfilling

  // const query = `
  //   WITH pool_vaults AS (
  //     SELECT DISTINCT
  //       liquidity_pool_address,
  //       token0_address,
  //       token1_address
  //     FROM solana.dex.pools
  //     WHERE project = 'pumpswap'
  //   ),
  //   vault_list AS (
  //     SELECT liquidity_pool_address as vault_address, token0_address as mint_address FROM pool_vaults
  //     UNION
  //     SELECT liquidity_pool_address as vault_address, token1_address as mint_address FROM pool_vaults
  //   ),
  //   latest_balances AS (
  //     SELECT 
  //       b.address,
  //       b.mint,
  //       b.raw_balance,
  //       b.block_timestamp,
  //       vl.mint_address,
  //       b.usd_balance as usd_balance,
  //       ROW_NUMBER() OVER (
  //         PARTITION BY b.address, b.mint 
  //         ORDER BY b.block_timestamp DESC, b.block_slot DESC, b.txn_index DESC
  //       ) as rn
  //     FROM solana.assets.balances b
  //     INNER JOIN vault_list vl ON b.address = vl.vault_address AND b.mint = vl.mint_address
  //     WHERE b.block_timestamp >= TO_TIMESTAMP_NTZ(${startTimestamp})
  //       AND b.block_timestamp < TO_TIMESTAMP_NTZ(${endTimestamp})
  //       AND b.is_voting = false
  //       AND b.raw_balance > 0
  //       AND b.usd_balance > 0
  //   )
  //   SELECT 
  //     mint_address,
  //     SUM(raw_balance) as total_raw_balance,
  //     SUM(usd_balance) as total_usd_balance
  //   FROM latest_balances
  //   WHERE rn = 1
  //     AND mint_address IS NOT NULL
  //   GROUP BY mint_address
  //   ORDER BY total_usd_balance DESC
  //   LIMIT 100000
  // `;

  const query = `
    WITH pool_vaults AS (
      SELECT DISTINCT
        liquidity_pool_address,
        token0_address,
        token1_address,
        token0_vault,
        token1_vault
      FROM solana.dex.pools
      WHERE project = 'pumpswap'
    ),
    vault_list AS (
      SELECT token0_vault as vault_address, token0_address as mint_address FROM pool_vaults
      UNION
      SELECT token1_vault as vault_address, token1_address as mint_address FROM pool_vaults
    ),
    latest_balances AS (
      SELECT 
        b.address,
        b.mint,
        b.raw_balance,
        vl.mint_address,
        b.usd_balance_current as usd_balance
      FROM solana.assets.balances_latest b
      INNER JOIN vault_list vl ON b.token_account = vl.vault_address AND b.mint = vl.mint_address
      WHERE b.raw_balance > 0
        AND b.usd_balance_current > 1000
    )
    SELECT 
      mint_address,
      SUM(raw_balance) as total_raw_balance,
      SUM(usd_balance) as total_usd_balance
    FROM latest_balances
    WHERE mint_address IS NOT NULL
    GROUP BY mint_address
    ORDER BY total_usd_balance DESC
    LIMIT 15000
    `

  const data = await queryAllium(query)

  for (const item of data) {
    api.add(item.mint_address, item.total_raw_balance)
  }
}


module.exports = {
  solana: { tvl, },
  timetravel: false,
  isHeavyProtocol: true,
}

// const idl = {
//   "address": "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
//   "metadata": {"name": "pump_amm", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
//   "instructions": [],
//   "accounts": [{"name": "Pool", "discriminator": [241, 154, 109, 4, 17, 177, 109, 188]}],
//   "events": [],
//   "errors": [],
//   "types": [
//     {
//       "name": "Pool",
//       "type": {
//         "kind": "struct",
//         "fields": [
//           {"name": "pool_bump", "type": "u8"},
//           {"name": "index", "type": "u16"},
//           {"name": "creator", "type": "pubkey"},
//           {"name": "base_mint", "type": "pubkey"},
//           {"name": "quote_mint", "type": "pubkey"},
//           {"name": "lp_mint", "type": "pubkey"},
//           {"name": "pool_base_token_account", "type": "pubkey"},
//           {"name": "pool_quote_token_account", "type": "pubkey"},
//           {"name": "lp_supply", "docs": ["True circulating supply without burns and lock-ups"], "type": "u64"}
//         ]
//       }
//     }
//   ]
// }