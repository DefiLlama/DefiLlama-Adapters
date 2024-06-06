const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: { tokenSafe: '0xc2e0f31d739cb3153ba5760a203b3bd7c27f0d7a', tokenList: '0x7c0bef36e1b1cbeb1f1a5541300786a7b608aede', },
  iotex: { tokenSafe: '0xc4a29a94f12be03033daa4e6ce9b9678c26275a2', tokenList: '0x59caeb8dc448df0e070b803062cfd9351ad39390', },
  bsc: { tokenSafe: '0xFBe9A4138AFDF1fA639a8c2818a0C4513fc4CE4B', tokenList: '0x0d793F4D4287265B9bdA86b7a4083193E8743b34', },
  polygon: { tokenSafe: '0xA239F03Cda98A7d2AaAA51e7bF408e5d73399e45', tokenList: '0xDe9395d2f4940aA501f9a27B98592589D14Bb0f7', },
}

module.exports = {
  hallmarks: [
    [1651881600, "UST depeg"],
  ],
};

Object.keys(config).forEach(chain => {
  const { tokenList, tokenSafe, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const [_, tokens] = await api.call({ abi: 'function getActiveItems(uint256 offset, uint8 limit) view returns (uint256 count, address[] items)', target: tokenList, params: [0, 99] })
      return sumTokens2({ api, tokens, owner: tokenSafe })
    }
  }
})

