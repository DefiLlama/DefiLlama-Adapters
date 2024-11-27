
module.exports = {
  methodology:
    "The liquidity on these three pools + the tokens staked on all three chains (PulseChain, Ethereum, and Binance Smart Chain)",
};

const config = {
  ethereum: { staking: '0xE639E9DC0E302f5dB025713009868c8adE4Ced26' },
  pulse: { staking: '0xDd91E607C919Db74e18C2845e4cfb22793c30b2f' },
  bsc: { staking: '0x1781e00780AfD93a03Bf5f9dED088a8578cE9B09' },
}

Object.keys(config).forEach(chain => {
  const { staking} = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: async (api) => {
      const stakingToken = await api.call({  abi: 'address:stakingToken', target: staking})
      return api.sumTokens({ owner: staking, tokens: [stakingToken]})
    }
  }
})