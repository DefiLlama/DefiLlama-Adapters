const IndexTokenAbi = require("./abi.json");
const axios = require("axios");
const sdk = require("@defillama/sdk");
const { Contract, ethers } = require("ethers");
const { providers } = require("@defillama/sdk/build/general");

const INDEX = "0xF17A3fE536F8F7847F1385ec1bC967b2Ca9caE8D";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const amount = "1000000000000000000";

const getBuyPrice = async () => {
  const result = await axios.get(
    `https://api.0x.org/swap/v1/price?buyToken=${INDEX}&sellToken=${USDC}&buyAmount=${amount}`
  );
  if (result && result.data) {
    return result.data;
  } else {
    throw "Could not fetch latest buy price";
  }
};

const getSellPrice = async () => {
  const result = await axios.get(
    `https://api.0x.org/swap/v1/price?buyToken=${USDC}&sellToken=${INDEX}&sellAmount=${amount}`
  );
  if (result && result.data) {
    return result.data;
  } else {
    throw "Could not fetch latest sell price";
  }
};

const getTotalSupply = async () => {
  const contract = new Contract(
    `${INDEX}`,
    IndexTokenAbi.abi,
    providers["ethereum"]
  );

  const totalInWei = await contract.totalSupply();
  const supply = ethers.utils.formatUnits(totalInWei, 18);
  return supply;
};

async function tvl(timestamp, block) {
  const balances = {};
  const [buy, sell, supply] = await Promise.all([
    getBuyPrice(),
    getSellPrice(),
    getTotalSupply(),
  ]);

  const buyPrice = parseFloat(buy.price);
  const sellPrice = parseFloat(sell.price);
  const totalSupply = parseFloat(supply);

  const balance = ((buyPrice + sellPrice) / 2) * totalSupply;
  sdk.util.sumSingleBalance(balances, INDEX, balance);
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Data is retrieved from calculation of market price and total supply",
  ethereum: {
    tvl,
  },
};
