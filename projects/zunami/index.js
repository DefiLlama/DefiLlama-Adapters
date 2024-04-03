const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const zunUSD = "0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6";
const zunUSDAps = "0x28e487bbF6b64867C29e61DccbCD17aB64082889";

async function ethTvl(api) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunUSD, }))
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunUSDAps, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  hallmarks: [
    [Math.floor(new Date('2023-08-13')/1e3), 'Project was hacked for $2M'],
  ],
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
};