const ADDRESSES = require('../helper/coreAssets.json');

const abis = {
  getAssetState: "function getAssetState() view returns (uint256 totalAstarDeposit, uint256 totalAstarStaked, uint256 totalAstarPendingToStake, uint256 totalAstarPendingBonus, uint256 totalAstarRedeemable, uint256 totalLstSupply)"
}

const CONFIG = {
  ethereum: {
    vault: '0x54Cd23460DF45559Fd5feEaaDA7ba25f89c13525',
    tokens: [
      ADDRESSES.null,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.WEETH,
      ADDRESSES.ethereum.EETH,
    ]
  },
  astar: {
    vault: '0x85031E58C66BA47A16Eef7A69514cd33EC16559c',
    token: ADDRESSES.astar.ASTR
  }
}

const eth_tvl = async (api) => {
  const { vault, tokens } = CONFIG[api.chain]
  return api.sumTokens({ tokens, owner: vault })
}

const astar_tvl = async (api) => {
  const { vault, token } = CONFIG[api.chain]
  const { totalAstarDeposit } = await api.call({ abi: abis.getAssetState, target: vault })
  return api.add(token, totalAstarDeposit)

}

module.exports = {
  methodology: 'TVL is calculated by retrieving all collaterals deposited on the chains before using CCIP',
  ethereum: { tvl: eth_tvl },
  astar: { tvl: astar_tvl }
}
