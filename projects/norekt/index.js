const ADDRESSES = require('../helper/coreAssets.json');

const POOL = '0x7DC86Ed3AE69cEB124494A5B5c10D0F335BD8bbE';
const COLLATERAL = '0x393A475a11ca04f29a185Cd31562110A9fa15fD8';

const abi = {
  poolToken: 'address:poolToken',
  totalBorrows: 'uint256:totalBorrows',
};

async function tvl(api) {
  const token = await api.call({ target: POOL, abi: abi.poolToken });
  return api.sumTokens({
    tokensAndOwners: [
      [token, POOL],
      [ADDRESSES.arbitrum.WETH, COLLATERAL],
    ],
  });
}

async function borrowed(api) {
  const [token, totalBorrows] = await Promise.all([
    api.call({ target: POOL, abi: abi.poolToken }),
    api.call({ target: POOL, abi: abi.totalBorrows }),
  ]);

  api.add(token, totalBorrows);
  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL is calculated as the USDC held in the NoRekt liquidity pool plus WETH collateral held in the collateral contract. Borrowed is calculated from the USDC pool's totalBorrows() view function, which includes outstanding principal and accrued unpaid interest.",
  arbitrum: {
    tvl,
    borrowed,
  },
};
