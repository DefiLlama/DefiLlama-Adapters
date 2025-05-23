const ADDRESSES = require('../helper/coreAssets.json')

const abis = {
  totalHoldings: "uint256:totalHoldings",
  totalSupply: "uint256:totalSupply",
  strategyCount: "function strategyCount() view returns (uint256)",
  strategyInfo: "function strategyInfo(uint256) view returns (address strategy, uint256 startTime, uint256 minted, bool enabled)",
}

const zunStaking = "0x45af4F12B46682B3958B297bAcebde2cE2E795c3";
const ZUN = "0x6b5204B0Be36771253Cc38e88012E02B752f0f36";

const configs = [
  { token: ADDRESSES.ethereum.DAI, target: '0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6' }, // zunUSD
  { token: ADDRESSES.ethereum.DAI, target: '0x28e487bbF6b64867C29e61DccbCD17aB64082889' }, // zunUSDAps
  { token: ADDRESSES.ethereum.WETH, target: '0xc2e660C62F72c2ad35AcE6DB78a616215E2F2222' }, // zunETH
  { token: ADDRESSES.ethereum.WETH, target: '0x5Ab3aa11a40eB34f1d2733f08596532871bd28e2' }, // zunETHAps
]

async function tvl(api) {
    for (const { token, target } of configs) {
    const strategies = await api.fetchList({
      itemAbi: abis.strategyInfo,
      lengthAbi: abis.strategyCount,
      target,
    });

    const total = strategies.reduce((sum, s) => sum + Number(s.minted), 0);
    api.add(token, total);
  }
}

async function staking(api) {
  api.add(ZUN, await api.call({ abi: abis.totalSupply, target: zunStaking, }))
}

module.exports = {
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
  hallmarks: [['2023-08-13', 'Project was hacked for $2M']],
  misrepresentedTokens: true,
  ethereum: { tvl, staking },
};