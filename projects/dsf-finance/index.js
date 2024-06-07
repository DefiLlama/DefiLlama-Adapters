const ADDRESSES = require('../helper/coreAssets.json')

const DSF_Contract_usdLP = "0x22586ea4fdaa9ef012581109b336f0124530ae69";
const DSF_Contract_Old_contract = "0x68837EefaA5852775928E9695079bF6444e99253";

async function ethTvl(api) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: "uint256:totalHoldings", target: DSF_Contract_usdLP, }))
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: "uint256:totalHoldings", target: DSF_Contract_Old_contract, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  hallmarks: [
    [Math.floor(new Date('2022-07-30')/1e3), 'The first smart contract was created'],
  ],
  methodology: "Total value of digital assets that are locked in DSF.Finance Omnipools",
};
