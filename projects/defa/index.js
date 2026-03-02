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

  const xdr = json?.result?.results?.[0]?.xdr;
  if (!xdr) throw new Error("TVL value not returned from Soroban simulation");

  // Decode u128 from last 16 bytes (matches your SIM_TX output)
  const buffer = Buffer.from(xdr, "base64");
  const value = BigInt("0x" + buffer.slice(-16).toString("hex"));

  return value;
}

async function tvl(api) {
    const activeTvl = await getActiveTvl();
  
    console.log("Raw TVL from contract (u128):", activeTvl.toString()); //exact value
  
    if (activeTvl === 0n) throw new Error("TVL is zero");
  
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
