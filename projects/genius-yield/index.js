const axios = require("axios");

async function staking() {
  return {
    "genius-yield":
      (await axios.get(
        "https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1w8r99sv75y9tqfdzkzyqdqhedgnef47w4x7y0qnyts8pznq87e4wh",
        {
          headers: {
            project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt"
          }
        }
      )).data.amount.find(
        token =>
          token.unit ===
          "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb0014df1047454e53"
      ).quantity / 1e6
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    staking,
    tvl: () => ({})
  }
};
