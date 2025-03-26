const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "TVL is calculated by retrieving the ETH balance of all meme coin contracts deployed by the Zircuit factory contract. The factory contract dynamically manages meme coins, and their ETH holdings are summed up to calculate the total TVL.",
  start: '2024-09-11',
  zircuit: {
    tvl,
  },
}

async function tvl(api) {
  const factory = '0x2FB9FbFF266CED68FCfEEC850e3ce9c58BB68Ec3';
  const memeCoins = await api.fetchList({  lengthAbi: 'allMemecoinsCount', itemAbi: 'allMemecoins', target: factory })
  return sumTokens2({ api, owners: memeCoins, token: nullAddress})
}
