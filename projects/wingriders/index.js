const axios = require("axios");

const headers = {
  "Accept-Encoding": "gzip, deflate, br",
};

async function tvl() {
  const liquidityPoolLocked = (
    await axios.post(
      "https://explorer.mainnet.wingriders.com/api/bulk/paymentCredentials/adaBalance",
      {
        paymentCredentials: [
          "e6c90a5923713af5786963dee0fdffd830ca7e0c86a041d9e5833e91",
        ],
      },
      { headers }
    )
  ).data.balance;
  const requestLocked = (
    await axios.post(
      "https://explorer.mainnet.wingriders.com/api/bulk/paymentCredentials/adaBalance",
      {
        paymentCredentials: [
          "86ae9eebd8b97944a45201e4aec1330a72291af2d071644bba015959",
        ],
      },
      { headers }
    )
  ).data.balance;
  return {
    cardano:
      (parseInt(liquidityPoolLocked, 10) * 2) / 1e6 +
      parseInt(requestLocked, 10) / 1e6,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
