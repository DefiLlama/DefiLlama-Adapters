const { ApiPromise, WsProvider } = require("@polkadot/api");

const tvl = async (api) => {
  const TREASURY_ADDRESS = "5HZAAREPzwBc4EPWWeTHA2WRcJoCgy4UBk8mwYFWR5BTCNcT";
  const wsProvider = new WsProvider('wss://entrypoint-finney.opentensor.ai:443');
  const bittensorApi = await ApiPromise.create({ provider: wsProvider });

  const { data } = (await bittensorApi.query.system.account(TREASURY_ADDRESS)).toJSON();
  api.addCGToken('bittensor', data.free / 1e9)
  api.addCGToken('bittensor', data.reserved / 1e9)
  return api.getBalances()
}

module.exports = {
  bittensor: {
    tvl,
  }
};