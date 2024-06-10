const { pool2 } = require('../helper/pool2')
const BTC_TOKEN_CONTRACT = '0xbD6323A83b613F668687014E8A5852079494fB68';
const ABTC_TOKEN_CONTRACT = '0xa709aaD0691Fc67279577566640ae1D6515c1b81';
const LP_TOKEN_CONTRACT = '0x4b398fCd7841412610b653B34E89c9b19a42EbFc';
const BTC_STAKING_CONTRACT = '0x1FDe0d2F44539789256D94D1784a86bF77D66DD0';
const LP_STAKING_CONTRACT = '0x1e4A10d18698E4450E13b4E8EF361a5841850611';

async function staking(api) {
  const data = (await api.call({ abi: abi.poolInfo, target: BTC_STAKING_CONTRACT, params: 0, }))
  api.add(data.lpToken, data.totalToken);
  api.add(BTC_TOKEN_CONTRACT, await api.call({ abi: 'erc20:totalSupply', target: ABTC_TOKEN_CONTRACT, }));
  return api.getBalances()
}

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking, 
    pool2: pool2(LP_STAKING_CONTRACT, LP_TOKEN_CONTRACT)
  }
};

const abi = {
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 totalToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accBTCPerShare, uint256 accUSDCPerShare)"
}