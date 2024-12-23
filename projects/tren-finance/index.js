const SSL_CONTRACT = '0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b'; 

async function tvl(api) {
  const totalSupply = await api.call({
    abi: {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
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
