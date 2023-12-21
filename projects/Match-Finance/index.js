const ADDRESSES = require('../helper/coreAssets.json')

const ETH_LBR_LP = '0x3a0ef60e803aae8e94f741e7f61c7cbe9501e569';
const LYBRA_STETH_VAULT = '0xa980d4c0C2E48d305b582AA439a3575e3de06f0E';
const LYBRA_REWARD_VAULT = '0xec7c6cd15d9bd98fc9805e0509e3bb2033c5956d';
const MATCH_FINANCE_CONTRACT = '0x04b9ce11da7323aEf03f6e6c16C0b93cFB44C55c';

const totalSuppliedAbi = 'function depositedAsset(address) external view returns (uint256)'

async function tvl(_, _1, _2, { api }) {
  const [
    totalSTETHSupplied,
    lpStaked,
  ] = await Promise.all([
    api.call({ abi: totalSuppliedAbi, params: MATCH_FINANCE_CONTRACT, target: LYBRA_STETH_VAULT }),
    api.call({ abi: 'erc20:balanceOf', params: MATCH_FINANCE_CONTRACT, target: LYBRA_REWARD_VAULT }),
  ]);

  api.add(ADDRESSES.ethereum.STETH, totalSTETHSupplied)
  api.add(ETH_LBR_LP, lpStaked)

  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  methodology: 'Get total amount of stETH supplied and ETH-LBR LP staked to Match Finance',
  ethereum: {
    tvl,
  }
}; 
