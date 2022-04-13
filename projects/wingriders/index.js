const axios = require("axios");

async function tvl() {
  const liquidityPoolLocked = (
    await axios.post(
      "https://explorer.mainnet.wingriders.com/api/bulk/paymentCredentials/adaBalance",
      {
        paymentCredentials: [
          "e6c90a5923713af5786963dee0fdffd830ca7e0c86a041d9e5833e91",
        ],
      }
    )
  ).data.balance;
  const requestLocked = (
    await axios.post(
      "https://explorer.mainnet.wingriders.com/api/bulk/paymentCredentials/adaBalance",
      {
        paymentCredentials: [
          "86ae9eebd8b97944a45201e4aec1330a72291af2d071644bba015959",
        ],
      }
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
