const WISE_ETH_PAIR_ADDR = '0x21b8065d10f73EE2e260e5B47D3344d3Ced7596E';
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const WETH_ADDR = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const WISE_TOKEN_ADDR = '0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6';

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

// WISE staking is HEX-style: staked tokens are burned from circulating supply and
// tracked internally, not held in a separate vault contract. globals().totalStaked
// on the token contract itself is the only source for this figure.
async function staking(api) {
  const globals = await api.call({
    target: WISE_TOKEN_ADDR,
    abi: 'function globals() view returns (uint256 totalStaked, uint256 totalShares, uint256 sharePrice, uint256 currentWiseDay, uint256 referralShares, uint256 liquidityShares)'
  });

  api.add(WISE_TOKEN_ADDR, globals.totalStaked);
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  methodology: 'TVL = ownerless (burned LP) share of ETH in the WISE/ETH Uniswap LP',
  ethereum: { tvl, staking }
};
