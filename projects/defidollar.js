/* ************************** *
 * Modules
 * ************************** */
var Web3 = require("web3");
const BigNumber = require("bignumber.js");
const CORE = require("./config/defidollar/abi.json");
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
const DECIMAL = new BigNumber(18);
const TEN = new BigNumber(10);

/* ************************** *
 * Methods
 * ************************** */
async function fetch() {
  var core = new WEB3.eth.Contract(CORE.abi, BASE);

  let tlv = await core.methods.totalSupply().call();
  tlv = BigNumber(tlv).dividedBy(TEN.pow(new BigNumber(DECIMAL)));
  console.log(tlv.toFixed(4));
  return tlv.toFixed(4);
}

fetch();

module.exports = {
  fetch,
};
