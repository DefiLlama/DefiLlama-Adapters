const STONEUSD_ETH = '0x6A6E3a4396993A4eC98a6f4A654Cc0819538721e';
const STONEUSD_BSC = '0x8B4E28607bdcacBf937f81F29E3DAFe7Bc1D7c0b';
const STONEUSD_MONAD = '0x095957CEB9f317ac1328f0aB3123622401766D71';

const tvl = (target) => async (api) => {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target,
  });

  api.add(target, totalSupply);
}

module.exports = {
  ethereum: {
    tvl: tvl(STONEUSD_ETH),
  },
  bsc: {
    tvl: tvl(STONEUSD_BSC),
  },
  monad: {
    tvl: tvl(STONEUSD_MONAD),
  },
  doublecounted: false
}
