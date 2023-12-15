const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const DSF_Contract_usdLP = "0x22586ea4fdaa9ef012581109b336f0124530ae69";

async function ethTvl(timestamp, block, _, { api }) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: DSF_Contract_usdLP, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  hallmarks: [
    [Math.floor(new Date('2022-12-03')/1e3), 'DSF.Finance was Started'],
  ],
  methodology: "Total value of digital assets that are locked in DSF.Finance Omnipools",
};
