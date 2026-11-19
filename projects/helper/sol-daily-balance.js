require('dotenv').config();
const { queryAllium } = require('../projects/helper/allium');

function escapeSqlString(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/'/g, "''");
}

/**
 * Build SQL for solana.assets.balances_daily (SOL + SPL), aggregated by mint/token_symbol.
 */
function buildDailyBalancesSql(addresses, opts = {}) {
  if (!addresses?.length) return '';
  const escaped = addresses.map(a => `'${escapeSqlString(a)}'`).join(', ');
  const conditions = [`address IN (${escaped})`];

  if (opts.tokenAddresses?.length) {
    const mints = opts.tokenAddresses.map(m => `'${escapeSqlString(m)}'`).join(', ');
    conditions.push(`mint IN (${mints})`);
  }
  if (opts.dateFrom) conditions.push(`date >= '${escapeSqlString(opts.dateFrom)}'`);
  if (opts.dateTo) conditions.push(`date <= '${escapeSqlString(opts.dateTo)}'`);
  if (opts.min_usd_amount != null && opts.min_usd_amount > 0) {
    conditions.push(`usd_amount >= ${Number(opts.min_usd_amount)}`);
  }

  return `
    SELECT
      mint,
      token_symbol,
      SUM(raw_amount) as raw_amount,
      SUM(amount) as amount,
      SUM(usd_amount) as usd_amount
    FROM solana.assets.balances_daily
    WHERE ${conditions.join(' AND ')}
    GROUP BY mint, token_symbol
    ORDER BY usd_amount DESC
      `.trim();
  }

/**
 * Fetch daily balances (SOL + SPL) for given addresses from Allium.
 * Table: solana.assets.balances_daily. Results aggregated by mint, token_symbol.
 * Uses ALLIUM_API_KEY from env (via projects/helper/allium).
 * @param {string[]} addresses - List of Solana addresses
 * @param {{ tokenAddresses?: string[], dateFrom?: string, dateTo?: string, min_usd_amount?: number }} [opts]
 * @returns {Promise<Array<{ mint, token_symbol, raw_amount, amount, usd_amount }>>}
 */
async function getSolanaDailyBalances(addresses, opts = {}) {
  const sql = buildDailyBalancesSql(addresses, opts);
  if (!sql) return [];
  const rows = await queryAllium(sql);
  return Array.isArray(rows) ? rows : [];
}

function truncateAddr(s, head = 6, tail = 4) {
  if (s == null || typeof s !== 'string') return s;
  if (s.length <= head + tail) return s;
  return s.slice(0, head) + '…' + s.slice(-tail);
}

function tableForDisplay(rows, truncateCols = ['mint']) {
  return rows.map(row => {
    const out = { ...row };
    for (const col of truncateCols) {
      if (col in out && out[col] != null) out[col] = truncateAddr(String(out[col]));
    }
    return out;
  });
}

async function main() {
  const TEST_DATE = '2025-10-10';

  const addresses = [
    '28nYGHJyUVcVdxZtzKByBXEj127XnrUkrE3VaGuWj1ZU', '38xCLm9kSExfGU1GdyVuX4vop7SZns9kU2mQyTmmMdUP',
  ];

  if (!addresses.length) {
    console.error('Pass addresses via ADDRESSES env (comma-separated) or first CLI arg');
    process.exit(1);
  }

  const dateFrom = TEST_DATE;
  const dateTo = TEST_DATE;
  const minUsd = 1;

  const opts = {
    tokenAddresses,
    dateFrom: dateFrom,
    dateTo: dateTo,
    min_usd_amount: minUsd,
  };
  const results = await getSolanaDailyBalances(addresses, opts);

  if (!results?.length) {
    console.log('No data found');
    return;
  }

  const top25 = results.slice(0, 25);
  console.log(`Top 25 by usd_amount (date: ${dateFrom}${dateTo !== dateFrom ? ` to ${dateTo}` : ''}), total rows: ${results.length}\n`);
  console.table(tableForDisplay(top25));
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = {
  getSolanaDailyBalances,
};
