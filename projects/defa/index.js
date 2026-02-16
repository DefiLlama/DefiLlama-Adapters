const fetch = require("node-fetch");

const RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";

const SIM_TX = "AAAAAgAAAABInMr//HjTQ5mfaqRBHzYCJKEHrM2r8m9/4lm9PBoMVgABhqAAAAAAAAAAAgAAAAEAAAAAAAAAAAAAAABpkzaBAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAB61PtVr2XWjuuWsIcyFlAq888asA0bR8BnY/AeIm0wxQAAAAOZ2V0X2FjdGl2ZV90dmwAAAAAAAAAAAAAAAAAAAAAAAA=";

async function getActiveTvl() {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "simulateTransaction",
    params: {
      transaction: SIM_TX,
    },
  };

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  const xdr = json?.result?.results?.[0]?.xdr;
  if (!xdr) return 0;

  const buffer = Buffer.from(xdr, "base64");
  const value = BigInt("0x" + buffer.slice(-16).toString("hex"));

  return Number(value);
}

async function tvl(api) {
  const activeTvl = await getActiveTvl();

  if (!activeTvl || activeTvl === 0)
    throw new Error("TVL is zero");

  api.addCGToken("usd-coin", activeTvl / 1e7);
  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts active invoice-backed liquidity via on-chain Logger contract on Stellar Soroban.",
  stellar: {
    tvl,
  },
};
