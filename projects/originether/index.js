const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("../origindollar/abi.json");


const ethTvl = async (api) => {
  const vault = "0x39254033945aa2e4809cc2977e7087bee48bd7ab";
  const nativeStaking = '0x34eDb2ee25751eE67F68A45813B22811687C0238'
  const nativeStaking2 = '0x4685dB8bF2Df743c861d71E6cFb5347222992076'
  const stakingBalance1 = await api.call({ abi: abi.checkBalance, target: nativeStaking, params: ADDRESSES.ethereum.WETH })
  api.add(ADDRESSES.ethereum.WETH, stakingBalance1)
  const stakingBalance2 = await api.call({ abi: abi.checkBalance, target: nativeStaking2, params: ADDRESSES.ethereum.WETH })
  api.add(ADDRESSES.ethereum.WETH, stakingBalance2)

  // add ETH part of curve LP
  const convexStrategy = '0x1827F9eA98E0bf96550b2FC20F7233277FcD7E63'
  const lp = await api.call({  abi: 'address:curvePool', target: convexStrategy})
  const ethIndex = await api.call({  abi: 'uint128:ethCoinIndex', target: convexStrategy})
  const lpBalance = await api.call({  abi: abi.checkBalance, target: convexStrategy, params: ADDRESSES.ethereum.WETH})
  const lpSupply = await api.call({  abi: 'erc20:totalSupply', target: lp})
  const ethInPool = await api.call({  abi: 'function balances(uint256) view returns (uint256)', target: lp, params: ethIndex})
  const ethLPBalance = (lpBalance / lpSupply) * ethInPool
  api.add(ADDRESSES.ethereum.WETH, ethLPBalance)


  return api.sumTokens({ owner: vault, tokens: [ADDRESSES.ethereum.WETH] })
}

async function baseTvl(api) {
  const vault = '0x98a0CbeF61bD2D21435f433bE4CD42B56B38CC93'
  const aeroAMO = '0xF611cC500eEE7E4e4763A05FE623E2363c86d2Af'
  const dripper = await api.call({ target: vault, abi: 'function dripper() view returns (address)' })
  const [amountWeth, _amountOETH] = await api.call({ abi: 'function getPositionPrincipal() view returns (uint256, uint256)', target: aeroAMO })
  api.add(ADDRESSES.base.WETH, amountWeth)
  return api.sumTokens({ owners: [vault], tokens: [ADDRESSES.base.WETH] })

}


module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
