const sdk = require("@defillama/sdk");

const RPC = "https://rpc.polymesh.network";
const POLYX_DECIMALS = 1e6;

// TVL = total amount bonded in staking (POLYX)
async function tvl() {
  // staking::ErasTotalStake(activeEra)
  // NOTE: active era is encoded in storage on Polymesh
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "state_getStorage",
    params: [
      // staking::ErasTotalStake for the current era
      // (Polymesh uses a single active era for staking)
      "0x5f3e4907f716ac89b6347d15ececedca4d5d1d7c92bdbf3cbe9a30a0f7d5b6c5"
    ],
  };

  const res = await sdk.fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = res?.result;
  if (!raw) return {};

  const totalPolyx = parseInt(raw, 16) / POLYX_DECIMALS;

  return {
    polymesh: totalPolyx,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts total staked POLYX by querying Polymesh staking storage for total bonded stake.",
  polymesh: { tvl },
};
