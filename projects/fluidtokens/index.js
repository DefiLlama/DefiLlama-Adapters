const axios = require("axios");

async function tvl() {
  const adaLocked = (
    await axios.get(
      "https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1wxzqzlncct5g0686c07lyuq3q3j2a0t8l88uwdznw99k9asz6z0hq",
      {
        headers: {
          project_id: "mainnetJscPwGl6cJ7dQSfvw5XW3EjqAkM0brat",
        },
      }
    )
  ).data.amount.find((token) => token.unit === "lovelace").quantity;
  return {
    cardano: adaLocked / 1e6,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
