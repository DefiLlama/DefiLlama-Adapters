const abi = require("./abi.json");

const vault = "0xa3c0eCA00D2B76b4d1F170b0AB3FdeA16C180186";

const sTvl = async (api) => {
  const tokens = await api.call({ abi: abi.getAllAssets, target: vault });
  const bals = await api.multiCall({ abi: abi.checkBalance, calls: tokens, target: vault });

  api.add(tokens, bals);
}

module.exports = {
  sonic: {
    tvl: sTvl
  },
};
