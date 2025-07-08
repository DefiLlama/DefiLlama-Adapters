const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("../origindollar/abi.json");


const ethTvl = async (api) => {
  const vault = "0x39254033945aa2e4809cc2977e7087bee48bd7ab";
  const strategies = await api.call({ abi: 'function getAllStrategies() view returns (address[])', target: vault })
  const isNativeStrategy = (await api.multiCall({  abi: 'uint256:activeDepositedValidators', calls: strategies, permitFailure: true})).map(i => !!i)
  const nativeStrategies = strategies.filter((_, i) => isNativeStrategy[i])

  // vault balance
  const vaultBalance = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.ethereum.WETH, params: vault })
  api.add(ADDRESSES.ethereum.WETH, vaultBalance)

  // add native strategies
  for(const nativeStrategy of nativeStrategies) {
    const stakingBalance = await api.call({ abi: abi.checkBalance, target: nativeStrategy, params: ADDRESSES.ethereum.WETH })
    api.add(ADDRESSES.ethereum.WETH, stakingBalance)
  }

  // add ETH part of convex OETH/ETH LP
  const convexStrategy = '0x1827F9eA98E0bf96550b2FC20F7233277FcD7E63'
  const convexLp = await api.call({  abi: 'address:curvePool', target: convexStrategy})
  const convexEthIndex = await api.call({  abi: 'uint128:ethCoinIndex', target: convexStrategy})
  const convexLpBalance = await api.call({  abi: abi.checkBalance, target: convexStrategy, params: ADDRESSES.ethereum.WETH})
  const convexLpSupply = await api.call({  abi: 'erc20:totalSupply', target: convexLp})
  const convexEthInPool = await api.call({  abi: 'function balances(uint256) view returns (uint256)', target: convexLp, params: convexEthIndex})
  const convexEthLPBalance = (convexLpBalance / convexLpSupply) * convexEthInPool
  api.add(ADDRESSES.ethereum.WETH, convexEthLPBalance)

  // add ETH part of curve OETH/WETH LP
  const curveStrategy = '0xba0e352AB5c13861C26e4E773e7a833C3A223FE6'
  const curveLp = await api.call({  abi: 'address:curvePool', target: curveStrategy})
  const curveEthIndex = await api.call({  abi: 'uint128:hardAssetCoinIndex', target: curveStrategy})
  const curveLpBalance = await api.call({  abi: abi.checkBalance, target: curveStrategy, params: ADDRESSES.ethereum.WETH})
  const curveLpSupply = await api.call({  abi: 'erc20:totalSupply', target: curveLp})
  const curveEthInPool = await api.call({  abi: 'function balances(uint256) view returns (uint256)', target: curveLp, params: curveEthIndex})
  const curveEthLPBalance = (curveLpBalance / curveLpSupply) * curveEthInPool
  api.add(ADDRESSES.ethereum.WETH, curveEthLPBalance)

  return api.sumTokens({ owner: vault, tokens: [ADDRESSES.ethereum.WETH] })
}

async function baseTvl(api) {
  const vault = '0x98a0CbeF61bD2D21435f433bE4CD42B56B38CC93'
  const aeroAMO = '0xF611cC500eEE7E4e4763A05FE623E2363c86d2Af'

  // vault balance
  const vaultBalance = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.base.WETH, params: vault })
  api.add(ADDRESSES.base.WETH, vaultBalance)

  // add aero AMO
  const [amountWeth, _amountOETH] = await api.call({ abi: 'function getPositionPrincipal() view returns (uint256, uint256)', target: aeroAMO })
  api.add(ADDRESSES.base.WETH, amountWeth)

  return api.sumTokens({ owners: [vault], tokens: [ADDRESSES.base.WETH] })
}

async function plumeTvl(api) {
  const vault = '0xc8c8F8bEA5631A8AF26440AF32a55002138cB76a'

  const vaultBalance = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.plume_mainnet.WETH, params: vault })
  api.add(ADDRESSES.plume_mainnet.WETH, vaultBalance)

  return api.sumTokens({ owners: [vault], tokens: [ADDRESSES.plume_mainnet.WETH] })
}


module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  base: {
    tvl: baseTvl,
  },
  plume_mainnet: {
    tvl: plumeTvl,
  }
};
