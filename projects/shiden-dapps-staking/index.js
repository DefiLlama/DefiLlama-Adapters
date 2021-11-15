
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { options } = require("@PlasmNetwork/api");

const SDN_DECIMALS = 18;


async function tvl() {
  const provider = new WsProvider("wss://rpc.shiden.astar.network");
  const api = await ApiPromise.create(options({ provider }));
  const era = (await api.query.dappsStaking.currentEra())
  const SDNLocked = (await api.query.dappsStaking.eraRewardsAndStakes(era)).toJSON() / 10 ** SDN_DECIMALS;

  return {
    'shiden': SDNLocked
  }
}

module.exports = {
  methodology: 'TVL considers SDN tokens deposited to the Dapps-Staking program',
  tvl
}