const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const CONTRACT_ADDRESS = "0x7474796140775d8719584AA9923102ad7bf56490";

async function tvl() {
  const eth = await sdk.api.eth.getBalance({
    target: CONTRACT_ADDRESS,
    chain: "blast"
  });

  return { [ADDRESSES.null]: eth.output };
}
module.exports = {
  timetravel: true,
  methodology:
    "Value of user deposited ETH on Flast Protocol is considered as TVL",
  blast: {
    tvl,
  },
};
