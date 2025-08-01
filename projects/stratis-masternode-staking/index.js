const abi = "function totalCollateralAmount() view returns (uint256)"

module.exports = {
  methodology: "TVL represents the total amount of STRAX tokens locked by STRAX Token Holders in the Stratis Masternode Staking contract.",
  stratis: {
    tvl: async (api) => {
      const totalCollateralAmount = await api.call({ target: '0x0000000000000000000000000000000000001002', abi })
      return { 'stratis': totalCollateralAmount / 1e18 }
    }
  }
}
