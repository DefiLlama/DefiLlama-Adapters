const axios = require("axios");

// ===== CONFIG =====
const SOROBAN_RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";
const LOGGER_CONTRACT_ADDRESS =
  "CBEWJH5HJJZ6LB77MOKAB7B4MQTYAHVSFG437HWBXC6K2YEL2CYVLW3D";
const LOGGER_FUNCTION = "get_active_tvl";

// Dummy source account (required by Soroban RPC)
const SOURCE_ACCOUNT =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

async function getActiveTvl() {
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "simulateTransaction",
    params: {
      transaction: {
        source: SOURCE_ACCOUNT,
        fee: "100000",
        operations: [
          {
            type: "invokeHostFunction",
            function: {
              type: "invokeContract",
              contractAddress: LOGGER_CONTRACT_ADDRESS,
              functionName: LOGGER_FUNCTION,
              args: [],
            },
          },
        ],
      },
    },
  };

  // No try-catch: let errors bubble up
  const res = await axios.post(SOROBAN_RPC_URL, payload);

  const result = res.data?.result;
  if (!result || result.error) throw new Error("Soroban RPC returned invalid data");

  const retval = result?.results?.[0]?.retval;
  if (!retval) throw new Error("Soroban RPC returned empty result");

  // Parse numeric value
  const tvl = Number(retval);
  if (!Number.isFinite(tvl)) throw new Error("Soroban RPC returned non-numeric result");

  return tvl;
}

async function tvl(api) {
  let activeTvl = await getActiveTvl();

// USDC has 7 decimals on Stellar (1 USDC = 10,000,000 base units)
api.addCGToken("usd-coin", activeTvl / 1e7);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts active invoice-backed liquidity via an on-chain Logger contract on Stellar Soroban. TVL is derived on-chain and exposed through a single read-only contract call.",
  stellar: {
    tvl,
  },
};
