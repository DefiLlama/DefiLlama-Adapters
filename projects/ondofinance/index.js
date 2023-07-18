
module.exports = {
  methodology: "Sums Ondo's fund supplies.",
  misrepresentedTokens: true,
  doublecounted: true,
};

const config = {
  ethereum: {
    OUSG: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
  },
  polygon: {
    OUSG: '0xbA11C5effA33c4D6F8f593CFA394241CfE925811',
  }
}

Object.keys(config).forEach(chain => {
  let funds = config[chain]
  funds = Object.values(funds)
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: funds })
      api.addTokens(funds, supplies)
    }
  }
})