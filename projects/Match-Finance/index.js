const ADDRESSES = require('../helper/coreAssets.json')

const ETH_LBR_LP = '0x3a0ef60e803aae8e94f741e7f61c7cbe9501e569';
const MATCH_TOKEN = '0xe0dcb3e02798d1c6a9650fe1381015ec34705153';
const LYBRA_STETH_VAULT = '0xa980d4c0C2E48d305b582AA439a3575e3de06f0E';
const LYBRA_REWARD_VAULT = '0xec7c6cd15d9bd98fc9805e0509e3bb2033c5956d';
const MATCH_FINANCE_CONTRACT = '0x04b9ce11da7323aEf03f6e6c16C0b93cFB44C55c';
const VLMATCH_STAKING_CONTRACT = '0x7D027083e55724A1082b8cDC51eE90781f41Ff14';

const totalSuppliedAbi = 'function depositedAsset(address) external view returns (uint256)'

async function tvl(api) {
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

async function staking(api) {
  const vlMatchStaked = await api.call({ abi: 'uint256:totalStaked', target: VLMATCH_STAKING_CONTRACT })
  api.add(MATCH_TOKEN, vlMatchStaked)
}

module.exports = {
  doublecounted: true,
  methodology: 'Get total amount of stETH supplied and ETH-LBR LP staked to Match Finance',
  ethereum: {
    tvl, staking,
  }
}; 
