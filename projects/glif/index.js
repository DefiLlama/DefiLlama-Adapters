const { nullAddress } = require("../helper/tokenMapping");

const IFIL_TOKEN_CONTRACT = "0x690908f7fa93afC040CFbD9fE1dDd2C2668Aa0e0";

async function tvl(_, _1, _2, { api }) {
  api.add(nullAddress, await api.call({ abi: "erc20:totalSupply", target: IFIL_TOKEN_CONTRACT, }))
}

module.exports = {
  methodology:
    "The Infinity Pool is accepting early depositers by minting 1 iFIL token per 1 FIL deposited. This adapter returns the total supply of iFIL tokens, representing the total amount of FIL and WFIL deposited into the early deposit contract.",
  filecoin: {
    tvl,
  },
};
