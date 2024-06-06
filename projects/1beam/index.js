const Abis = require('./abi.json');

const Contracts = {
  moonbeam: {
    pools: {
      'ob3p': '0x04e274f709e1ae71aff4f994b4267143ec6a381a',
      'ob3pbusd': '0x7e758319d46E0A053220e3728B3eE47a1979316a',
    },
  }
}

const moonbeamTvl = async (api) => {
  const pools = Object.values(Contracts.moonbeam.pools)
  const tokens = await api.multiCall({  abi: Abis.getTokens, calls: pools })
  const bals = await api.multiCall({  abi: Abis.getTokenBalances, calls: pools })
  tokens.forEach((token, i) => {
    api.addTokens(token, bals[i])
  });
  api.removeTokenBalance('0xe7a7dfb89f84a0cf850bcd399d0ec906ab232e9d')
};

module.exports = {
  moonbeam: {
    tvl: moonbeamTvl,
  },
};
