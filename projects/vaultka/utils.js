const axios = require("axios");
const sdk = require("@defillama/sdk");
const gmReader = require("./abi.json");
const ethers = require("ethers");

const gmMarket = {
  eth: {
    indexToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    longToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    shortToken: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    marketToken: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
  },
  arb: {
    indexToken: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    longToken: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    shortToken: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    marketToken: "0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407",
  },
};

async function getGmPrice(token) {
  const data = await axios.get("https://arbitrum.gmx-oracle.io/prices/tickers");
  const price = data.data.filter(
    (ticker) => ticker.tokenSymbol === token.toUpperCase()
  )[0];

  const minPrice = Number(price.minPrice) * 10 ** price.oracleDecimals;
  const maxPrice = Number(price.maxPrice) * 10 ** price.oracleDecimals;

  const result = await sdk.api2.abi.call({
    //get the abi of getMarketTokenPrice from gmReader abi.json
    abi: gmReader,
    target: "0x38d91ED96283d62182Fc6d990C24097A918a4d9b",
    chain: "arbitrum",
    params: [
      // call contract

      // datastore address
      "0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8",
      // market
      {
        ...gmMarket[token],
      },
      // index token price
      {
        min: minPrice,
        max: maxPrice,
      },
      // long token price
      {
        min: minPrice,
        max: maxPrice,
      },
      // short token price
      {
        min: ethers.utils.parseUnits("1", 24),
        max: ethers.utils.parseUnits("1", 24),
      },
      hashString("MAX_PNL_FACTOR_FOR_DEPOSITS"),
      true,
    ],
  });

  function hashData(dataTypes, dataValues) {
    const bytes = ethers.utils.defaultAbiCoder.encode(dataTypes, dataValues);
    const hash = ethers.utils.keccak256(ethers.utils.arrayify(bytes));

    return hash;
  }

  function hashString(string) {
    return hashData(["string"], [string]);
  }

  // get from gmx tickers api

  return Number(result[0]) / 1e12;
}
module.exports = getGmPrice;
