const ABI = require("./abi.json");
const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");

const RPC_URL = "https://public-node-api.klaytnapi.com/v1/cypress";
const DASHBOARD_ADDR = "0xFb28dD9EF87c61fcD09f62594a38637B0cc98B58";

const fetchLiquidity = async () => {
  const caver = new Caver(RPC_URL);
  const contract = new caver.klay.Contract(ABI.abi, DASHBOARD_ADDR);
  const tvl = await contract.methods.tvl().call();
  return toUSDTBalances(tvl / 1e18);
};

module.exports = {
  klaytn: {
    tvl: fetchLiquidity,
  },
};
