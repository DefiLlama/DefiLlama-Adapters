const { getBalance } = require('../helper/chain/bittensor')

const TREASURY_ADDRESS = "5HZAAREPzwBc4EPWWeTHA2WRcJoCgy4UBk8mwYFWR5BTCNcT";

module.exports = {
  timetravel: false,
  bittensor: {
    tvl: async () => {
      const balance = await getBalance(TREASURY_ADDRESS);
      return {
        bittensor: balance,
      };
    },
  },
}
