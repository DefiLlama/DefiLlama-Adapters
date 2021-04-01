/* ************************** *
 * Modules
 * ************************** */
const DUSD = require("./config/defidollar/abi.json");

/* ************************** *
 * Constants
 * ************************** */
const WEB3 = require('./config/web3.js');
const BASE = "0x5bc25f649fc4e26069ddf4cf4010f9f706c23831";

/* ************************** *
 * Methods
 * ************************** */
async function fetch() {
  var dusd = new WEB3.eth.Contract(DUSD.abi, BASE);
  return WEB3.utils.fromWei(await dusd.methods.totalSupply().call());
}

module.exports = {
  fetch,
};
