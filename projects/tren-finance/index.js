const SSL_CONTRACT = '0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b'; 

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'function totalSupply() view returns (uint256)',
    target: SSL_CONTRACT,
  });

  api.add(SSL_CONTRACT, totalSupply);
}

module.exports = {
  methodology: 'We count the total supply of the SSL token on Arbitrum.',
  start: 1000235,
  arbitrum: {
    tvl,
  },
};
