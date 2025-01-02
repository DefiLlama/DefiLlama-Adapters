const abi = require("./abi.json");

const vault = "0x2D62f6D8288994c7900e9C359F8a72e84D17bfba";

async function tvl(api) {
  const tokens = await api.call({ abi: abi.getAllAssets, target: vault })
  const bals = await api.multiCall({ abi: abi.checkBalance, target: vault, calls: tokens })
  api.add(tokens, bals)
}

module.exports = {
  polygon: {
    tvl,
  },
};
