const { pool2 } = require('./helper/pool2');
const { sumTokens2 } = require('./helper/unwrapLPs');

const tokens = {
  DAI: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  dQUICK: '0xf28164a485b0b2c90639e47b0f377b4a438a16b1'
};

async function tvl(_, _b, _cb, { api, }) {
  const tokensAndOwners = [
    [tokens.dQUICK, '0x151757c2E830C467B28Fe6C09c3174b6c76aA0c5'],
    [tokens.dQUICK, '0x203F5c9567d533038d2da70Cbc20e6E8B3f309F9'],
    [tokens.DAI, '0xaee4d11a16B2bc65EDD6416Fb626EB404a6D65BD'],
    [tokens.DAI, '0xd7052EC0Fe1fe25b20B7D65F6f3d490fCE58804f'],
    [tokens.DAI, '0x91993f2101cc758D0dEB7279d41e880F7dEFe827'],
    [tokens.DAI, '0xd85E038593d7A098614721EaE955EC2022B9B91B'],
  ]
  return sumTokens2({ ...api, tokensAndOwners, })
}

// node test.js projects/gainsNetwork.js
module.exports = {
  polygon: {
    tvl,
    pool2: pool2('0x33025b177A35F6275b78f9c25684273fc24B4e43', '0x6e53cb6942e518376e9e763554db1a45ddcd25c4', 'polygon')
  }
};