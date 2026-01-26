const axios = require("axios");

const SOROBAN_RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";
const LOGGER_CONTRACT_ADDRESS = "CBEWJH5HJJZ6LB77MOKAB7B4MQTYAHVSFG437HWBXC6K2YEL2CYVLW3D";
const LOGGER_FUNCTION = "get_active_tvl";
const SOURCE_ACCOUNT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

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

  try {
    const res = await axios.post(SOROBAN_RPC_URL, payload);
    const result = res.data?.result;
    if (!result || result.error) return 0;

    const retval = result?.results?.[0]?.retval;
    if (!retval) return 0;

    const tvl = Number(retval);
    return Number.isFinite(tvl) ? tvl : 0;
  } catch {
    return 0;
  }
}

async function tvl(api) {
  let activeTvl = await getActiveTvl();
  if (typeof activeTvl === "bigint") activeTvl = Number(activeTvl);
  api.addCGToken("usd-coin", activeTvl / 1e6);
  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts active invoice-backed liquidity via an on-chain Logger contract on Stellar Soroban. TVL is derived on-chain and exposed through a single read-only contract call.",
  stellar: { tvl },
};
