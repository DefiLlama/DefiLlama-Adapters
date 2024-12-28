const { sumTokens2 } = require('../helper/unwrapLPs')
const civFarmContract = "0x8a774F790aBEAEF97b118112c790D0dcccA61099"
const stakingTokens = [
  "0x37fE0f067FA808fFBDd12891C0858532CFE7361d",
  "0x73A83269b9bbAFC427E76Be0A2C1a1db2a26f4C2",
];

const pool2Tokens = [
  '0xED247449A7CA06DB5b27B44B2c092f0B48bbDB77',
  '0x6C406daecA809382E649d6c8f768450bF8Dbc1dD',
  '0xA65653BB6e1338dbCe69191bb1328700881fC051',
]

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl: () => ({}),
        staking: async (_, block) => sumTokens2({ block, owner: civFarmContract, tokens: stakingTokens}),
        pool2: async (_, block) => sumTokens2({ block, owner: civFarmContract, tokens: pool2Tokens}),
    },
}
