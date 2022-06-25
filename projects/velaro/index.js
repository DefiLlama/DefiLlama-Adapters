const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'velas'
module.exports = {
  velas: {
    tvl: async (_, _b, { [chain]: block }) => {
      return sumTokens2({
        tokensAndOwners: [
          ['0xe41c4324dCbD2926481101f8580D13930AFf8A75', '0xbd183a60274289A7c20250a890500D2a37dEf319'], // VLX
          ['0xaBf26902Fd7B624e0db40D31171eA9ddDf078351', '0x2Fee5293050FFfC3bd583d59f077e2b4900F57c8'], // WAG
          ['0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', '0x899F26dc6Bc085fb9cB82AAdF25Db8820F272ED4'], // WBTC
          ['0x7b714BC5dD176EaA198fe6C07E415a87A40dc858', '0x7171d1E1097d726E5f4BBc8236A8E108E21024e3'], // WAG_VLXVDGT
          ['0x72eB7CA07399Ec402c5b7aa6A65752B6A1Dc0C27', '0x1e217990818518Dc37B0fFA2ffE3AA110b02F18c'], // ASTRO 
          ['0x2B8e9cD44C9e09D936149549a8d207c918ecB5C4', '0xc0D16c7Cd5Fc18526Dc78Ea530e56129EB979C96'], // BNB
          ['0xc9b3aA6E91d70f4ca0988D643Ca2bB93851F3de4', '0x92C2cA50f74A8Fe36b4DCffB2cc6A274fA61CB34'], // FTM
          ['0x6ab0B8C1a35F9F4Ce107cCBd05049CB1Dbd99Ec5', '0xd10f8CD5d56aaa58f59B25C928f372F66899e9B3'], // MATIC
          ['0xc111c29A988AE0C0087D97b33C6E6766808A3BD3', '0x4368d9F91C40EA8Ac9F11A4f9289889f56D32Df8'], // BUSD
        ],
        resolveLP: true,
        chain, block
      })
    }
  },
}
