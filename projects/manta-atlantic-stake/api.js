const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");

const MANTA_TOKEN_DECIMALS = 18;

function formatNumber(text) {
  return String(text ?? "").replace(/,/g, "");
}

async function tvl() {
  const polkadotProvider = new WsProvider("wss://ws.archive.manta.systems");
  const polkadotApi = await ApiPromise.create({ provider: polkadotProvider });

  const pools = await polkadotApi.query.parachainStaking.candidatePool();
  const result = pools.toHuman().reduce((total, pool) => {
    return total.plus(formatNumber(pool.amount));
  }, new BigNumber(0));
  return {
    "manta-network": result.div(10 ** MANTA_TOKEN_DECIMALS).toFixed(4),
  };
}

module.exports = {
  timetravel: false,
  methodology: "Manta Atlantic staking platform",
  manta_atlantic: { tvl },
};
