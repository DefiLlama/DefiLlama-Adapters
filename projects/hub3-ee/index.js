const { PublicKey } = require("@solana/web3.js");
const { getConnection, } = require("../helper/solana");


async function tvl() {
  const programId = new PublicKey("2pi53pUUC5S4zyUU6Wrbe6EfYXS9LNcpikpwPFahtQQw");
  const accounts = await getConnection().getProgramAccounts(programId, {
    filters: [{
      dataSize: 94
    }],
    dataSlice: { offset: 0, length: 1 } // we dont care about the data, just the lamports
  })

  return {
    solana: accounts.reduce((tvl, { account }) => { return tvl + account.lamports / 1e9 }, 0)
  }
}


module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
