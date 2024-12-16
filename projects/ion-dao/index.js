const { sumTokens } = require('../helper/chain/cosmos')

const chain = 'osmosis'

const ION_DAO_CONTRACT =
  "osmo1yg8930mj8pk288lmkjex0qz85mj8wgtns5uzwyn2hs25pwdnw42sf745wc";

async function tvl() {
  return sumTokens({ owner: ION_DAO_CONTRACT, chain })
}

module.exports = {
  timetravel: false, // need to add code to fetch osmosis block
  osmosis: {
    tvl,
  },
};
