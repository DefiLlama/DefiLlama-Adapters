const axios = require("axios");

const RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";

const SIM_TX =
  "AAAAAgAAAABInMr//HjTQ5mfaqRBHzYCJKEHrM2r8m9/4lm9PBoMVgABhqAAAAAAAAAAAgAAAAEAAAAAAAAAAAAAAABpkzaBAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAB61PtVr2XWjuuWsIcyFlAq888asA0bR8BnY/AeIm0wxQAAAAOZ2V0X2FjdGl2ZV90dmwAAAAAAAAAAAAAAAAAAAAAAAA=";

async function getActiveTvl() {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "simulateTransaction",
    params: {
      transaction: SIM_TX,
    },
  };

  const { data: json } = await axios.post(RPC_URL, body, {
    headers: { "Content-Type": "application/json" },
  });

  console.log("=== RPC RESPONSE ===");
  console.log(JSON.stringify(json, null, 2));

  const xdr = json?.result?.results?.[0]?.xdr;
  if (!xdr) throw new Error("TVL value not returned from Soroban simulation");

  // Decode u128 from last 16 bytes of XDR
  const buffer = Buffer.from(xdr, "base64");
  const value = BigInt("0x" + buffer.slice(-16).toString("hex"));

  return value;
}

async function tvl(api) {
  const activeTvl = await getActiveTvl();

  if (activeTvl === 0n) throw new Error("TVL is zero");

  // Soroban contract returns value with 7 decimals
  const normalized = Number(activeTvl) / 1e7;

  api.addCGToken("usd-coin", normalized);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL represents the total active liquidity across invoice-backed pools as reported directly by the on-chain Logger contract via Soroban simulation (get_active_tvl).",
  stellar: {
    tvl,
  },
};
