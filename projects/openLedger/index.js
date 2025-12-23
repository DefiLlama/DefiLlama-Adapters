const sdk = require("@defillama/sdk");

const OCTO = "0xC4B6A514449375eD2208E050540dBDf0dCAdA619";
const TOKENS = [
  "0xA227Cc36938f0c9E09CE0e64dfab226cad739447"
];

async function tvl(_, _b, _cb, { api }) {
  for (const token of TOKENS) {
    const bal = await api.call({
      abi: "erc20:balanceOf",
      target: token,
      params: [OCTO],
    });
    api.add(token, bal);
  }
}

module.exports = {
  ethereum: {
    tvl,
  },
};
