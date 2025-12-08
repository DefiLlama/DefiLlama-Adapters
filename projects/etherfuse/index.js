const { sumTokens2, } = require("../helper/solana")

const owners = [
   '2cbUAqNoySYkG5R7edjm1WLXgtty6PeCRDVJ7zZbodQm',  // usdc deposit on mint 
    '4Lgz21ZmgtgtGikoQy5ZpuCuBCwTZoLx364rHiQwngsH',  // usdc-cetes vault
    'ETkRSHbbWrzyqt4fFNu7bP29WCDL9kfmatnaMV2EgZGE', // usdc-eurob vault
    'H6Fqdwz9Z4dk8hotxLwN3LFx1sMZNZiCyoLWnQjfPzkf', // usdc-gilts vault
    '3bYZCXv6rWpbT3zizsTArUdZ4SEmDRMCWtjzasz8nVpK',  // usdc-tesouro vault
    'HhqQYBYbb3MHT8fiAidoxzH3eE5GvStgrEzkvk9ci9uF'   //usdc-ustry vault
]

async function tvl() {
  return sumTokens2({ owners });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
