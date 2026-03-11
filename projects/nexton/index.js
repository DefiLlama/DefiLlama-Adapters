const { call } = require("../helper/chain/ton");

const contractAddress = "EQBED_4VLQC-SRdrVCtmcmwO7PtnvdLSRFRYNaGIZBqpaQHQ";

const tvl = async (api) => {
  const tonStaked = (await call({ target: contractAddress, abi: "tonStaked" }))[0];
  api.addGasToken(tonStaked)
}

module.exports = {
  ton: {
    tvl
  }
}
