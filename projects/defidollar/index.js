/* ************************** *
 * Modules
 * ************************** */
const TOKEN = require("../config/defidollar/tokenABI.json");
const ORACLE = require("../config/defidollar/EACAggregatorABI.json");
const WEB3 = require("../config/web3.js");

/* ************************** *
 * Constants
 * ************************** */
const DUSD = "0x5bc25f649fc4e26069ddf4cf4010f9f706c23831";
const IBBTC = "0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F";
const BTC_USD_ORACLE = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";

/* ************************** *
 * Methods
 * ************************** */
async function fetch() {
  const dusd = new WEB3.eth.Contract(TOKEN.abi, DUSD);
  const ibBTC = new WEB3.eth.Contract(TOKEN.abi, IBBTC);
  const btcUsdOracle = new WEB3.eth.Contract(ORACLE.abi, BTC_USD_ORACLE);

  const [dusdSupply, ibbtcSupply, pps, btcPrice] = (
    await Promise.all([
      dusd.methods.totalSupply().call(),
      ibBTC.methods.totalSupply().call(),
      ibBTC.methods.pricePerShare().call(),
      btcUsdOracle.methods.latestAnswer().call(),
    ])
  ).map(WEB3.utils.toBN);

  const _1e26 = WEB3.utils.toBN(10).pow(WEB3.utils.toBN(26));
  return WEB3.utils.fromWei(
    ibbtcSupply.mul(pps).mul(btcPrice).div(_1e26).add(dusdSupply)
  );
}

module.exports = {
  name: "DefiDollar",
  token: "DFD",
  fetch,
};
