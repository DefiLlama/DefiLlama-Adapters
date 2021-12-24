const { fetchURL } = require("../helper/utils");

const endpoints = {
  ethereum: "https://api.curve.fi/api/getAllPoolsVolume/ethereum",
};

const graphs = (chain) => async () => {
  let res;
  switch (chain) {
    case "ethereum":
      res = await fetchURL(endpoints.ethereum);
    default:
      res = await fetchURL(endpoints.ethereum);
  }

  return {
    dailyVolume: res?.data?.data?.totalVolume,
  };
};

module.exports = {
  ethereum: graphs("ethereum"),
};

// const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");

// const test = async () => {
//   const { timestamp, chainBlocks } = await getCurrentBlocks();
//   console.log(chainBlocks, "chainBlocks");

//   graphs("bsc")(timestamp, chainBlocks).then((res) => {
//     console.log(res);
//   });
// };

// test();
