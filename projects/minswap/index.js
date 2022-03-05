const axios = require("axios");

async function tvl() {
  const liquidityPoolLocked = (
    await axios.get(
      "https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1z9tu3ecccgqlhgg2nkshfrt8td2zs8fmrwvrchgksl78x96j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq26n58l",
      {
        headers: {
          project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt",
        },
      }
    )
  ).data.amount.find((token) => token.unit === "lovelace").quantity;
  const batchOrderLocked = (
    await axios.get(
      "https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1wyx22z2s4kasd3w976pnjf9xdty88epjqfvgkmfnscpd0rg3z8y6v",
      {
        headers: {
          project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt",
        },
      }
    )
  ).data.amount.find((token) => token.unit === "lovelace").quantity;
  return {
    cardano: (liquidityPoolLocked * 2) / 1e6 + batchOrderLocked / 1e6,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
