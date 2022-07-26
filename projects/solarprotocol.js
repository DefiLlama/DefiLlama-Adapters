const retry = require("async-retry");
const axios = require("axios");

const solarApiEndponit = "https://solarprotocol-api.vercel.app/api/stars";
const priceEndpoint =
  "https://api.dexscreener.com/latest/dex/tokens/0x08d70A47D3f28BbF755ae050a783844b40ae5761";

async function fetch() {
  let total = 0;
  const starTypesRequest = await retry(
    async (bail) => await axios.get(solarApiEndponit)
  );
  const starTypes = starTypesRequest.data;
  const priceRequest = await retry(
    async (bail) => await axios.get(priceEndpoint)
  );
  const pair = priceRequest.data;
  const price = pair.pairs[0].priceNative;
  starTypes.map((val) => {
    total += (val.price * price + val.stablePrice) * val.count;
  });
  return total;
}

fetch();

module.exports = {
  fetch,
};
