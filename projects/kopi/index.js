const { sumTokens } = require('../helper/chain/cosmos');

async function tvl(api) {
  return sumTokens({ api, owner: 'kopi14t4jnhmjejj08x5w8f4t0r3lv820gvh85xw8np', blacklistedTokens: [
    // excluding projects own tokens
    'ukopi',
    'ukusd',
  ]})
}

module.exports = {
  kopi: {
    tvl
  }
};

