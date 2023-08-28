const { getDenomBalance } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')

const chain = 'osmosis'

const ION_DAO_CONTRACT =
  "osmo1yg8930mj8pk288lmkjex0qz85mj8wgtns5uzwyn2hs25pwdnw42sf745wc";

async function tvl() {
  const balances = {
    uion: await getDenomBalance({ owner: ION_DAO_CONTRACT, denom: 'uion', chain})
  }
  return transformBalances(chain, balances)
}

module.exports = {
  timetravel: false, // need to add code to fetch osmosis block
  start: 5887991,
  osmosis: {
    tvl,
  },
};
