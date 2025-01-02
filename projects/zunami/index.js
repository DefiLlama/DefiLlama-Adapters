const ADDRESSES = require('../helper/coreAssets.json')
const poolAbi = {
  "totalHoldings": "uint256:totalHoldings"
}
const stakingAbi = {
  "totalSupply": "uint256:totalSupply"
}

const zunUSD = "0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6";
const zunUSDAps = "0x28e487bbF6b64867C29e61DccbCD17aB64082889";

const zunETH = "0xc2e660C62F72c2ad35AcE6DB78a616215E2F2222";
const zunETHAps = "0x5Ab3aa11a40eB34f1d2733f08596532871bd28e2";

const zunStaking = "0x45af4F12B46682B3958B297bAcebde2cE2E795c3";

const ZUN = "0x6b5204B0Be36771253Cc38e88012E02B752f0f36";

async function ethTvl(api) {
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: poolAbi.totalHoldings, target: zunUSD, }))
  api.add(ADDRESSES.ethereum.DAI, await api.call({ abi: poolAbi.totalHoldings, target: zunUSDAps, }))
  api.add(ADDRESSES.ethereum.WETH, await api.call({ abi: poolAbi.totalHoldings, target: zunETH, }))
  api.add(ADDRESSES.ethereum.WETH, await api.call({ abi: poolAbi.totalHoldings, target: zunETHAps, }))
}

async function staking(api) {
  api.add(ZUN, await api.call({ abi: stakingAbi.totalSupply, target: zunStaking, }))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    staking,
  },
  hallmarks: [
    [Math.floor(new Date('2023-08-13')/1e3), 'Project was hacked for $2M'],
  ],
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
};