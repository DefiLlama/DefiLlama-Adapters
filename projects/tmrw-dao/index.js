const axios = require("axios");

const tvl = async (api) => {
  const options = {
    method: "GET",
    url: "https://api.tmrwdao.com/api/app/networkdao/staking",
  };

  const response = await axios(options);

  return {
    'coingecko:aelf': response.data.data / 1e8,
  }
};

module.exports = {
  misrepresentedTokens: true,
  methodology: `extract data from the votes staked by business partners of the aelf Network DAO`,
  aelf: {
    tvl,
  },
};
