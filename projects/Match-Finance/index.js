const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

const STETH_CONTRACT = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
const ETH_LBR_LP = '0x3a0ef60e803aae8e94f741e7f61c7cbe9501e569';
const WETH_CONTRACT = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const LBR_CONTRACT = '0xed1167b6dc64e8a366db86f2e952a482d0981ebd';
const LYBRA_STETH_VAULT = '0xa980d4c0C2E48d305b582AA439a3575e3de06f0E';
const MATCH_FINANCE_CONTRACT = '0x04b9ce11da7323aEf03f6e6c16C0b93cFB44C55c';

const totalSuppliedAbi = 'function totalSupplied(address _mintPool) external view returns (uint256)'
const totalStakedAbi = 'function totalStaked() external view returns (uint256)'
const lpReserveAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const lpSuppliesAbi = "uint256:totalSupply"
const token0Abi = "address:token0"
const token1Abi = "address:token1"

async function tvl(_, _1, _2, { api }) {
  const [
    totalSupplied,
    totalStaked,
    lpReserve,
    lpSupply,
    token0,
    token1
  ] = await Promise.all([
    api.call({ abi: totalSuppliedAbi, target: MATCH_FINANCE_CONTRACT, params: [LYBRA_STETH_VAULT] }),
    api.call({ abi: totalStakedAbi, target: MATCH_FINANCE_CONTRACT, params: [] }),
    api.call({ abi: lpReserveAbi, target: ETH_LBR_LP, params: [] }),
    api.call({ abi: lpSuppliesAbi, target: ETH_LBR_LP, params: [] }),
    api.call({ abi: token0Abi, target: ETH_LBR_LP, params: [] }),
    api.call({ abi: token1Abi, target: ETH_LBR_LP, params: [] }),
  ]);

  const ratio = totalStaked / lpSupply;
 
  const tokens = [
    STETH_CONTRACT, 
    token0, 
    token1
  ];
  const balances = [
    totalSupplied, 
    lpReserve._reserve0 * ratio, 
    lpReserve._reserve1 * ratio
  ];
  api.addTokens(tokens, balances);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Get total amount of stETH supplied and ETH-LBR LP staked to Match Finance',
  ethereum: {
    tvl,
  }
}; 
