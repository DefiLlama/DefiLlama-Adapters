const SSL_CONTRACT = '0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b'; 

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'function totalSupply() view returns (uint256)',
    target: SSL_CONTRACT,
  });

  const rewardRate = await api.call({
    abi: 'function allocationPerSecond() view returns (uint256)',
    target: SSL_CONTRACT,
  });

  const price = 0.04;

  const rewardValuePerYear =
    (rewardRate / 1e18) * price * 365 * 24 * 60 * 60;

  const stakedValue = (totalSupply / 1e18) * price;

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
  tvl,
};
