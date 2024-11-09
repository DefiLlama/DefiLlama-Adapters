const { pool2 } = require("../helper/pool2");

const Contracts = {
  Pool: "0x22787c26Bb0Ab0d331Eb840ff010855a70A0DcA6",
  Chef: "0xB6a34b9C6CeeE0D821BDBD98Bc337639fdD5663b",
  XEN_ETH_LP: "0xf32fdB63d0A976Cc6ceC939f2824FCF7F9819F68",
  LOCKED_XEN_ETH_LP: "0x57A480007DFbce2803147DCcBeAFAEb50BDe64Fb",
};

async function tvl(api) {
  const { tokens }= await api.call({  abi: 'function getAllAssets() view returns (address[] tokens, bool[])', target: Contracts.Pool})
  return api.sumTokens({ owner: Contracts.Pool, tokens })
}

module.exports = {
  base: {
    tvl,
    pool2: pool2([Contracts.Chef, Contracts.LOCKED_XEN_ETH_LP], Contracts.XEN_ETH_LP),
  },
};
