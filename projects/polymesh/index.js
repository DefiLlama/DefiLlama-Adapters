const { Polymesh } = require("@polymeshassociation/polymesh-sdk");

const POLYX_DECIMALS = 6;
const RPC_ENDPOINT = "wss://mainnet-rpc.polymesh.network/";

async function tvl() {
  let polymesh;
  try {
    polymesh = await Polymesh.connect({ nodeUrl: RPC_ENDPOINT });
    const api = polymesh._polkadotApi;

    // Get staking data
    const activeEra = await api.query.staking.activeEra();
    if (!activeEra || !activeEra.isSome) return {};
    
    const currentEra = activeEra.unwrap().index.toNumber();
    const totalStake = await api.query.staking.erasTotalStake(currentEra);
    
    // Convert to POLYX (DefiLlama will handle USD conversion)
    const stakedPolyx = Number(totalStake.toString()) / Math.pow(10, POLYX_DECIMALS);
    
    // Return with chain identifier (DefiLlama handles pricing)
    return {
      'polymesh': stakedPolyx
    };
  } finally {
    if (polymesh) await polymesh.disconnect().catch(() => {});
  }
}

module.exports = {
  timetravel: false,
  methodology: "Counts staked POLYX tokens in the Proof-of-Stake consensus mechanism",
  start: 1639612800, // December 16, 2021
  polymesh: { tvl },
};
