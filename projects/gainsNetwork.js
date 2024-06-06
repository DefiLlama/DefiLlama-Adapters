const ADDRESSES = require('./helper/coreAssets.json')
const { pool2 } = require("./helper/pool2");
const { staking } = require("./helper/staking");
const { sumTokens2 } = require("./helper/unwrapLPs");

const tokens = {
  polygon: {
    DAI: ADDRESSES.polygon.DAI,
    dQUICK: "0xf28164a485b0b2c90639e47b0f377b4a438a16b1",
  },
  arbitrum: {
    DAI: ADDRESSES.optimism.DAI,
  },
};

async function polyTvl(api) {
  const tokensAndOwners = [
    [tokens.polygon.dQUICK, "0x151757c2E830C467B28Fe6C09c3174b6c76aA0c5"],
    [tokens.polygon.dQUICK, "0x203F5c9567d533038d2da70Cbc20e6E8B3f309F9"],
    [tokens.polygon.DAI, "0xaee4d11a16B2bc65EDD6416Fb626EB404a6D65BD"],
    [tokens.polygon.DAI, "0xd7052EC0Fe1fe25b20B7D65F6f3d490fCE58804f"],
    [tokens.polygon.DAI, "0x91993f2101cc758D0dEB7279d41e880F7dEFe827"],
    [tokens.polygon.DAI, "0xaee4d11a16B2bc65EDD6416Fb626EB404a6D65BD"],
  ];
  return sumTokens2({ api, tokensAndOwners });
}
async function arbiTvl(api) {
  const tokensAndOwners = [
    [tokens.arbitrum.DAI, "0xd85E038593d7A098614721EaE955EC2022B9B91B"],
    [tokens.arbitrum.DAI, "0xcFa6ebD475d89dB04cAd5A756fff1cb2BC5bE33c"],
  ];
  return sumTokens2({ api, tokensAndOwners });
}
// node test.js projects/gainsNetwork.js
module.exports = {
  hallmarks: [
    [1672531200,"Launch on Arbitrum"]
  ],
  polygon: {
    tvl: polyTvl,
    pool2: pool2(
      "0x33025b177A35F6275b78f9c25684273fc24B4e43",
      "0x6e53cb6942e518376e9e763554db1a45ddcd25c4",
      "polygon",
    ),
    staking: staking('0xfb06a737f549eb2512eb6082a808fc7f16c0819d', '0xE5417Af564e4bFDA1c483642db72007871397896'),
  },
  arbitrum: {
    tvl: arbiTvl,
    staking: staking(['0x6b8d3c08072a020ac065c467ce922e3a36d3f9d6', '0x7edDE7e5900633F698EaB0Dbc97DE640fC5dC015'], '0x18c11fd286c5ec11c3b683caa813b77f5163a122'),
  },
};
