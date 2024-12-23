const SSL_CONTRACT = '0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b'; 
const SSL_PRICE = 0.04;

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'function totalSupply() view returns (uint256)',
    target: SSL_CONTRACT,
  });

  const rewardRate = await api.call({
    abi: 'function allocationPerSecond() view returns (uint256)',
    target: SSL_CONTRACT,
  });

  const rewardValuePerYear =
    (rewardRate / 1e18) * SSL_PRICE * 365 * 24 * 60 * 60;

  const stakedValue = (totalSupply / 1e18) * SSL_PRICE;

  const apy = (rewardValuePerYear / stakedValue) * 100;

  return [
    {
      pool: SSL_CONTRACT,
      chain: 'arbitrum',
      project: 'tren-finance',
      symbol: 'USDT/SSL',
      tvlUsd: stakedValue,
      apy: apy,
    }
  ]
}

module.exports = {
  methodology: 'TVL is calculated by fetching the total supply of the SSL contract and multiplying it by the price of SSL.',
  arbitrum: {
    tvl,
  },
};
