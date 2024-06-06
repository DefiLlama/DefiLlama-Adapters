const ADDRESSES = require('../helper/coreAssets.json')


const contracts = {
  canto:{
    token: '0xfb8255f0de21acebf490f1df6f0bdd48cc1df03b',
    oracle: '0x1d18c02bc80b1921255e71cf2939c03258d75470'
  },
  ethereum:{
    token: '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b',
    oracle: '0x4c48bcb2160F8e0aDbf9D4F3B034f1e36d1f8b3e'
  }
}

const tvl = async (api) => {
  const totalSupply = await api.call({ target: contracts[api.chain].token, abi: 'uint256:totalSupply'});
  const rate = await api.call({ target: contracts[api.chain].oracle, abi: 'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'});

  return {
    [ADDRESSES.ethereum.USDC]: (totalSupply * rate.answer)/1e8
  };
}

module.exports = {
  canto: {
    tvl
  },
  ethereum:{tvl}
};
