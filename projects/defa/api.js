//  axios-only adapter
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

  const res = await axios.post(SOROBAN_RPC_URL, payload);

  const result = res.data?.result;
  if (!result || result.error) return 0;

  // If RPC returns a value, parse it safely
  const retval = result?.results?.[0]?.retval;
  if (!retval) return 0;

  // Most gateways return number-like values already
  const tvl = Number(retval);
  return Number.isFinite(tvl) ? tvl : 0;
}

module.exports = {
  getActiveTvl,
};