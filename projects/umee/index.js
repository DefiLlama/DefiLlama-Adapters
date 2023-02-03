const axios = require("axios");
const { getApiTvl } = require("../helper/historicalApi");

async function tvl(timestamp) {
  return getApiTvl(
    timestamp,
    async () => {
      const data = await axios.get(
        "https://testnet-client-bff-ocstrhuppq-uc.a.run.app/tvl"
      );
      return data.data;
    },
    async () => {
      const data = await axios.get(
        "https://testnet-client-bff-ocstrhuppq-uc.a.run.app/tvl/" + timestamp
      );
      console.log(data.data);
      return data.data;
    }
  );
}

module.exports = {
  methodology: "Total supplied assets.",
  umee: {
    tvl,
  },
};
