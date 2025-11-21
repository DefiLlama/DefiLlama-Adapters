import { CHAIN } from "../../helpers/chains";
import { Dependencies } from "../../adapters/types";
import { queryDuneSql } from "../../helpers/dune";

// Global start time = 2025-08-12 
const GLOBAL_START = "2025-08-12";

// Supported chains
const chains = {
  [CHAIN.ETHEREUM]: { duneChain: "ethereum", start: GLOBAL_START },
  [CHAIN.ARBITRUM]: { duneChain: "arbitrum", start: GLOBAL_START },
  [CHAIN.BASE]:     { duneChain: "base",     start: GLOBAL_START },
};

// ---------------------- PREFETCH ----------------------
const prefetch = async (options) => {
  const { startTimestamp, endTimestamp } = options;

  return queryDuneSql(options, `
    WITH txs AS (
      -- ETHEREUM
      SELECT 'ethereum' AS chain, block_time, hash
      FROM ethereum.transactions
      WHERE "to" IN (
        '0x875B5ff698B74B26f39C223c4996871F28AcDdea',
        '0xc1f545fe807b72429952dbfefe8702658e4c5875',
        '0xF80b9914465D12CB254A5E34cB7f20c2b96E6212',
        '0xC9537A0203690BdB042e1b41fB1Be420580B5977'
      ) AND success = TRUE

      UNION ALL

      -- ARBITRUM
      SELECT 'arbitrum' AS chain, block_time, hash
      FROM arbitrum.transactions
      WHERE "to" IN (
        '0x93dDB2307F3Af5df85F361E5Cddd898Acd3d132d',
        '0xAf1189aFd1F1880F09AeC3Cbc32cf415c735C710',
        '0x3509F38e10eB3cDcE7695743cB7e81446F4d8A33'
      ) AND success = TRUE

      UNION ALL

      -- BASE
      SELECT 'base' AS chain, block_time, hash
      FROM base.transactions
      WHERE "to" IN (
        '0x6DFee10D13d5B43AaF97bDA908C1D76d4313aF5f',
        '0x3BE160B3442F667ec97A565D053d1d1038082dB0',
        '0x56C99Cb127efEe215AaD7929Ed6884ABA283D70C',
        '0x787CBdE1662e7bcdB19897Dd284597314d5791aD',
        '0xb54B0b444B2268158b4b70B3aD00Ce21fedae6C3',
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