const axios = require("axios");

async function tvl() {
  const liquidityPoolLocked = (
    await axios.get(
      "https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha",
      {
        headers: {
          project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt",
        },
      }
    )
  ).data.amount.find((token) => token.unit === "lovelace").quantity;
  const batchOrderLocked = (
    await axios.get(
      "https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1wxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt",
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
