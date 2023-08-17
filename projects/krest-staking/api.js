const { ApiPromise, WsProvider } = require("@polkadot/api");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk")


function formatTokenAmount(amount, tokenSymbol) {
  let decimals = 18;

  switch (tokenSymbol) {
    case "DOT":
      decimals = 10;
      break;

    case "KSM":
      decimals = 12;
      break;

    case "ETH":
    case "KRST":
    case "PEAQ":
        // default value
        break;
    }

  return Number(amount / Number(10 ** decimals));
}

async function tvl() {
  const provider = new WsProvider("wss://wss-krest.peaq.network");
  const api = new ApiPromise({ provider });
  await api.isReady;

  // Get Krest Balances.locks.
  const balanceLocks = await api.query.balances.locks.entries();
  const totalLocked = balanceLocks.reduce(function(pv, cv) { return cv + pv }, 0);
  // const totalCollatorStake = await api.query.parachainStaking.totalCollatorStake.entries();

  return formatTokenAmount(totalLocked, "KRST");
}

module.exports = {
  timetravel: false,
  methodology: "Staked KREST tokens on KREST parachain.",
  krest: {
    tvl,
  },
}; 
