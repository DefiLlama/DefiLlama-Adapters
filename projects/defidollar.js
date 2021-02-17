/* ************************** *
 * Modules
 * ************************** */
var Web3 = require("web3");
const DFD = require("./config/defidollar/abi.json");
const ENV = require("dotenv").config();

/* ************************** *
 * Constants
 * ************************** */
const WEB3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${ENV.parsed.INFURA_KEY}`
  )
);
const BASE = "0x20c36f062a31865bED8a5B1e512D9a1A20AA333A";

/* ************************** *
 * Methods
 * ************************** */
async function fetch() {
  var dfd = new WEB3.eth.Contract(DFD.abi, BASE);
  return WEB3.utils.fromWei(await dfd.methods.totalSupply().call());
}

module.exports = {
  fetch,
};
