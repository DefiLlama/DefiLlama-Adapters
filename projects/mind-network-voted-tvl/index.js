const config = {
  ethereum: {
    pufETH: "0xD9A442856C234a39a81a089C06451EBAa4306a72"
  }
}

module.exports = {
  methodology: 'Voted TVL counts the total value of staked tokens contributed by partners to tokenize voting power.',
}; 

Object.keys(config).forEach(chain => {
  const targets = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = Object.values(targets);
      await Promise.all(tokens.map(async token => {
        const totalSupply = await api.call({
          abi: 'erc20:totalSupply',
          target: token,
        });
        api.add(token, totalSupply)
      }))
    }
  }
})