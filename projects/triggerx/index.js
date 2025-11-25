const { queryDuneSql } = require("../../helpers/dune");
const { Dependencies } = require("../../adapters/types");
const { CHAIN } = require("../../helpers/chains");

// Global start time = 2025-08-12
const GLOBAL_START = "2025-08-12";

// Only arbitrum for now
const chains = {
  arbitrum: {
    duneChain: "arbitrum",
    start: GLOBAL_START,
  },
};

// ---------------------- PREFETCH ----------------------
const prefetch = async (options) => {
  const { startTimestamp, endTimestamp } = options;

  return queryDuneSql(options, `
    WITH txs AS (
      SELECT 'arbitrum' AS chain, block_time, hash
      FROM arbitrum.transactions
      WHERE "to" IN (
        '0x93dDB2307F3Af5df85F361E5Cddd898Acd3d132d',
        '0xAf1189aFd1F1880F09AeC3Cbc32cf415c735C710',
        '0x3509F38e10eB3cDcE7695743cB7e81446F4d8A33'
      )
      AND success = TRUE
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
  if (!config) throw new Error("Missing chain config: " + chain);

  const rows = options.preFetchedResults || [];
  const row = rows.find(r => r.blockchain === config.duneChain);

  return {
    timestamp: endTimestamp,
    dailyTransactionCount: row?.tx_count ?? 0,
  };
};

// ---------------------- EXPORT ----------------------
module.exports = {
  version: 1,
  dependencies: [Dependencies.DUNE],
  isExpensiveAdapter: true,
  prefetch,
};

// Loop through supported chains, same as example structure
Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    start: chains[chain].start,
    fetch: fetchTxCount,
  };
});
