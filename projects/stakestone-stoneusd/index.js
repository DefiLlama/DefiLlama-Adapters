const STONEUSD_ETH = '0x6A6E3a4396993A4eC98a6f4A654Cc0819538721e';
const STONEUSD_MONAD = '0x095957CEB9f317ac1328f0aB3123622401766D71';

const ethTvl = async (api) => {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: STONEUSD_ETH,
  });

  api.add(STONEUSD_ETH, totalSupply)
}

const monadTvl = async (api) => {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: STONEUSD_MONAD,
  });

  api.add(STONEUSD_MONAD, totalSupply)
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  monad: {
    tvl: monadTvl,
  },
  doublecounted: false
}
