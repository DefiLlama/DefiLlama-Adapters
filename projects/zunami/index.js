const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const zunUSD = "0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6";
const zunUSDAps = "0x28e487bbF6b64867C29e61DccbCD17aB64082889";
const zunETH = "0xc2e660C62F72c2ad35AcE6DB78a616215E2F2222";
const zunETHAps = "0x5Ab3aa11a40eB34f1d2733f08596532871bd28e2";

async function ethTvl(api) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunUSD, }))
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: abi.totalHoldings, target: zunUSDAps, }))
  api.add(ADDRESSES.ethereum.WETH, await api.call({ abi: abi.totalHoldings, target: zunETH, }))
  api.add(ADDRESSES.ethereum.WETH, await api.call({ abi: abi.totalHoldings, target: zunETHAps, }))
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