const ADDRESSES = require('../helper/coreAssets.json')
const WISE_ETH_PAIR_ADDR = '0x21b8065d10f73EE2e260e5B47D3344d3Ced7596E';
const ZERO_ADDR = ADDRESSES.null;
const WETH_ADDR = ADDRESSES.ethereum.WETH;

async function tvl(api) {
  const [unownedUniLP, totalUniLP, reserves] = await Promise.all([
    api.call({ target: WISE_ETH_PAIR_ADDR, abi: 'erc20:balanceOf', params: [ZERO_ADDR] }),
    api.call({ target: WISE_ETH_PAIR_ADDR, abi: 'erc20:totalSupply' }),
    api.call({ target: WISE_ETH_PAIR_ADDR, abi: 'function getReserves() view returns (uint112,uint112,uint32)' })
  ]);

  const ethResWise = BigInt(reserves[1]); // ETH is token1
  const unowned = BigInt(unownedUniLP);
  const total = BigInt(totalUniLP);

  const uniswapOwnerlessEth = total === 0n ? 0n : (ethResWise * unowned) / total;

  api.add(WETH_ADDR, uniswapOwnerlessEth);
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  methodology: 'TVL = ownerless (LP tokens burned) share of ETH in the WISE/ETH Uniswap LP',
  ethereum: { tvl }
};
