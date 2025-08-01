const abi = "function totalCollateralAmount() view returns (uint256)"

module.exports = {
  methodology: "Tvl data that staked on Stratis Masternode staking contract by community.",
  stratis: {
    tvl: async (api) => {
      const totalCollateralAmount = await api.call({ target: '0x0000000000000000000000000000000000001002', abi })
      return { 'stratis': totalCollateralAmount / 1e18 }
    }
  }
}
