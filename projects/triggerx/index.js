import { CHAIN } from "../../helpers/chains";
import { Dependencies } from "../../adapters/types";
import { queryDuneSql } from "../../helpers/dune";

// Global start time = 2025-08-12 
const GLOBAL_START = "2025-08-12";

// Supported chains (ONLY ARBITRUM)
const chains = {
  [CHAIN.ARBITRUM]: { duneChain: "arbitrum", start: GLOBAL_START },
};

// ---------------------- PREFETCH ----------------------
const prefetch = async (options) => {
  const { startTimestamp, endTimestamp } = options;

  return queryDuneSql(options, `
    WITH txs AS (
      -- ARBITRUM ONLY
      SELECT 'arbitrum' AS chain, block_time, hash
      FROM arbitrum.transactions
      WHERE "to" IN (
        '0x93dDB2307F3Af5df85F361E5Cddd898Acd3d132d',
        '0xAf1189aFd1F1880F09AeC3Cbc32cf415c735C710',
        '0x3509F38e10eB3cDcE7695743cB7e81446F4d8A33'
      ) AND success = TRUE
    )

    SELECT
      chain AS blockchain,
      COUNT(DISTINCT hash) AS tx_count
    FROM txs
    WHERE block_time >= FROM_UNIXTIME(${startTimestamp})
      AND block_time < FROM_UNIXTIME(${endTimestamp})
    GROUP BY 1;
  `);
};

// ---------------------- FETCH ----------------------
const fetchTxCount = async (_, _1, options) => {
  const { endTimestamp, chain } = options;

  const config = chains[chain];
  if (!config) throw new Error(`Chain config missing for ${chain}`);

  const rows = options.preFetchedResults || [];
  const row = rows.find(r => r.blockchain === config.duneChain);

  return {
    timestamp: endTimestamp,
    dailyTransactionCount: row?.tx_count ?? 0,
  };
};

// ---------------------- EXPORT ----------------------
const adapter = {
  version: 1,
  dependencies: [Dependencies.DUNE],
  isExpensiveAdapter: true,
  prefetch,

  adapter: Object.fromEntries(
    Object.entries(chains).map(([chain, { start }]) => [
      chain,
      { start, fetch: fetchTxCount },
    ])
  ),
};

export default adapter;