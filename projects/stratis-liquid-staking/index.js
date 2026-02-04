const STAKING_CONTRACT = '0x9490e998E3f1f65064a41a11cd66F2aA54aF68D7';
const abi = "function balancesSnapshot() view returns (uint256 _block, uint256 _totalEth, uint256 _totalLsdToken)"

module.exports = {
  methodology: "Tvl data that staked on Stratis liquid staking protocol by community .",
  stratis: {
    tvl: async (api) => {
      const { _totalEth } = (await api.call({ target: STAKING_CONTRACT, abi: abi }))
      return { 'stratis': _totalEth / 1e18 }
    }
  }
}
