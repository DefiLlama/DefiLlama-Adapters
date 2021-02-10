/* ************************** *
 * Modules
 * ************************** */
var Web3 = require("web3");
const DUSD = require("./config/defidollar/abi.json");
const ENV = require("dotenv").config();

/* ************************** *
 * Constants
 * ************************** */
const WEB3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${ENV.parsed.INFURA_KEY}`
  )
);
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
