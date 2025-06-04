const { ApiPromise, WsProvider } = require("@polkadot/api");

const RPC_ENDPOINT = "wss://hydradx-rpc.dwellir.com";
const HDX_CG_ID = "hydradx"; // Direct Coingecko ID for HydraDX

// Function accepts { api } from the SDK, similar to hydration-dex
async function stakingTvl({ api }) {
  console.log("Starting stakingTvl function (dex-inspired method)...");
  const provider = new WsProvider(RPC_ENDPOINT);
  const polkadotApi = await ApiPromise.create({ provider });
  await polkadotApi.isReady;

  const hdxMeta = await polkadotApi.query.assetRegistry.assets(0);
  const hdxDecimals = hdxMeta.isSome ? Number(hdxMeta.unwrap().decimals.toJSON()) : 12;

  const positions = await polkadotApi.query.staking.positions.entries();
  let totalStakedHdx = 0n;

  for (const [_key, positionOpt] of positions) {
    if (positionOpt.isSome) {
      const position = positionOpt.unwrap();
      totalStakedHdx += position.stake.toBigInt();
    }
  }

  await polkadotApi.disconnect();

  if (totalStakedHdx > 0n) {
    const finalStakedAmountInHdx = parseFloat(totalStakedHdx.toString()) / (10 ** hdxDecimals);
    console.log(`Total HDX staked: ${finalStakedAmountInHdx}`);

    // Add the raw HDX token amount using its Coingecko ID
    // The { skipChain: true } option is often used when providing a direct CG ID
    api.add(HDX_CG_ID, finalStakedAmountInHdx, { skipChain: true });
    console.log(`Added ${finalStakedAmountInHdx} ${HDX_CG_ID} to API balances.`);

  } else {
    console.log("Total staked HDX is zero.");
    // Optionally, explicitly add 0 if no HDX staked, though api.getBalances() would be empty for this token
    // api.add(HDX_CG_ID, 0, { skipChain: true }); 
  }

  return api.getBalances(); // Return the balances accumulated in the api object
}

module.exports = {
  stakingTvl,
};
