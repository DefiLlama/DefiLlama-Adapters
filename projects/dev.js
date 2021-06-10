const utils = require("./helper/utils");
const BigNumber = require("bignumber.js");

const web3 = require("./config/web3.js");

const ADDRESS_CONFIG_ADDRESS = "0x1D415aa39D647834786EB9B5a333A50e9935b796";
const TOKEN_ADDRESS = "0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26";
const TOKEN_ID = "dev-protocol";

const ADDRESS_CONFIG_ABI = [
  {
    constant: true,
    inputs: [],
    name: "lockup",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const LOCKUP_ABI = [
  {
    constant: true,
    inputs: [],
    name: "getAllValue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const KEYS = [
  {
    TOKEN_ADDRESS: TOKEN_ID,
  },
];

async function fetch() {
  const addressConfigInstance = await new web3.eth.Contract(
    ADDRESS_CONFIG_ABI,
    ADDRESS_CONFIG_ADDRESS
  );
  const lockupAddress = await addressConfigInstance.methods.lockup().call();
  const lockupInstance = await new web3.eth.Contract(LOCKUP_ABI, lockupAddress);
  const [allValue, priceFeed, decimals] = await Promise.all([
    lockupInstance.methods.getAllValue().call(),
    utils.getPrices(KEYS),
    utils.returnDecimals(TOKEN_ADDRESS),
  ]);
  const price = priceFeed.data[TOKEN_ID].usd;
  const tvl = new BigNumber(allValue).div(10 ** decimals).times(price);
  return parseFloat(tvl.toFixed());
}

module.exports = {
  fetch,
};
