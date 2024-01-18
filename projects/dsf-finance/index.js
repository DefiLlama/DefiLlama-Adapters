const ADDRESSES = require('../helper/coreAssets.json')

const DSF_Contract_usdLP = "0x22586ea4fdaa9ef012581109b336f0124530ae69";

async function ethTvl(timestamp, block, _, { api }) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: "uint256:totalHoldings", target: DSF_Contract_usdLP, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Total value of digital assets that are locked in DSF.Finance Omnipools",
};
