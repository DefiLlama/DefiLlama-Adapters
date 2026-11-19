const ADDRESSES = require('../helper/coreAssets.json');

const POOL = '0xFCCC86B1759CF6bD37F420C225F5e74EB6F664CE';
const COLLATERAL = '0x97855B5E8F454a0953470Fe13E99E331c7193a72';

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
