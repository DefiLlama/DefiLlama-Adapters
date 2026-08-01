const { nullAddress } = require('../helper/tokenMapping');
async function bscTvl(api) {
  const bal = await api.call({ abi: 'erc20:totalSupply', target: '0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B' })
  const tvl = await api.call({ abi: 'function convertSnBnbToBnb(uint256 _amountInBnbX) external view returns (uint256)', target: '0x1adB950d8bB3dA4bE104211D5AB038628e477fE6' , params:[bal]})
  return {
    ['bsc:' + nullAddress]: tvl
  };
}

module.exports = {
  doublecounted: true,
  methodology: 'We aggregated the assets staked across synclub staking protocols',
  bsc: {
    tvl: bscTvl
  }
}
