const axios = require("axios");
const BigNumber = require("bignumber.js");

async function staking() {
  const rollPrice = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ninjaroll&vs_currencies=usd");
  const rollPoolState = await axios.get(
    `https://sentry.lcd.injective.network/cosmwasm/wasm/v1/contract/inj1fuf8u3d8fk2p34anz3f72tct6q8sr5hvxxv4x4/smart/${btoa(JSON.stringify({ state: {} }))}`
  );
  const rollTvl = new BigNumber(rollPrice?.data?.ninjaroll?.usd)
    .times(rollPoolState?.data?.data?.total_bond_amount)
    .div(new BigNumber(10).pow(18))
    .toNumber()
  return {
    tether: rollTvl
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL counts the ROLL tokens staked in the Ninjaroll staking contract",
  injective: { tvl: staking },
};
