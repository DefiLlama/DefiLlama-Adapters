const WISE_ETH_PAIR_ADDR = '0x21b8065d10f73EE2e260e5B47D3344d3Ced7596E';
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const WETH_ADDR = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

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
  methodology: 'TVL = ownerless (unclaimed) share of ETH in the WISE/ETH Uniswap LP',
  ethereum: { tvl }
};
