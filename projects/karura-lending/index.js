const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@acala-network/api");

async function tvl() {
  const provider = new WsProvider("wss://karura-rpc-1.aca-api.network");
  const api = await ApiPromise.create(options({ provider }));

  // Query for all KSM positions, if there were multiple token positions
  // you could use loans.totalPositions.entries() to query them all at once
  const positions = await api.query.loans.totalPositions({ Token: "KSM" })
  const totalCollateral = BigInt(positions.toJSON().collateral);

  return {
    "kusama" : Number(totalCollateral)/1e12
  }
}

module.exports = {
  methodology: "Counts collateral in lending market",
  tvl
}