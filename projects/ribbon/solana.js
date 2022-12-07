const { get } = require('../helper/http')

const tvl = async () => {
  const vault = await get("https://solana-vault.uc.r.appspot.com/tvl")

  return {
    solana: +vault.sol.tvl
  };
};

module.exports = {
  solana: {
    tvl,
  },
};
