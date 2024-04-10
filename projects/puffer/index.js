const PUF_ETH = '0xD9A442856C234a39a81a089C06451EBAa4306a72';

async function tvl(api) {
  return api.erc4626Sum({ calls: [PUF_ETH], isOG4626: true })
}

module.exports = {
  doublecounted: true,
  methodology: 'Returns the total assets owned by the Puffer Vault on Ethereum.',
  start: 19128047,
  ethereum: {
    tvl,
  }
}; 