const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

module.exports = {
  zircuit: {
    tvl,
    methodology: "TVL is calculated by retrieving the ETH balance of all meme coin contracts deployed by the Zircuit factory contract. The factory contract dynamically manages meme coins, and their ETH holdings are summed up to calculate the total TVL.",
    start: 2762128
  },
};

async function tvl(api, block) {
  let balances = {};
  const factory = '0x2FB9FbFF266CED68FCfEEC850e3ce9c58BB68Ec3';
  const memeCoins = await api.fetchList({  lengthAbi: abi.allMemecoinsCount, itemAbi: abi.allMemecoins, target: factory })
  const { output: ethBalances } = await sdk.api.eth.getBalances({
    targets: memeCoins,
    chain: 'zircuit',
  });
  ethBalances.forEach((ethBalance) => {
    sdk.util.sumSingleBalance(balances, 'coingecko:ethereum', ethBalance.balance / 1e18);
  }); 

  return balances
}
