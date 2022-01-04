const {tokenHolderBalances} = require('../helper/tokenholders')

module.exports={
    tvl: tokenHolderBalances([
        {
          tokens: [],
          holders: [
            "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc", // 0.1 ETH
            "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936", // 1 ETH
            "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", // 10 ETH
            "0xa160cdab225685da1d56aa342ad8841c3b53f291", // 100 ETH
          ],
          checkETHBalance: true,
        },
        {
          tokens: '0x6b175474e89094c44da98b954eedeac495271d0f',   // DAI
          holders: [
            "0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3",
            "0xFD8610d20aA15b7B2E3Be39B396a1bC3516c7144",
            "0x07687e702b410Fa43f4cB4Af7FA097918ffD2730",
            "0x23773E65ed146A459791799d01336DB287f25334",
          ],
        },
        {
          tokens: '0xdac17f958d2ee523a2206206994597c13d831ec7',   // USDT
          holders: [
            "0x169AD27A470D064DEDE56a2D3ff727986b15D52B",
            "0x0836222F2B2B24A3F36f98668Ed8F0B38D1a872f",
            "0xF67721A2D8F736E75a49FdD7FAd2e31D8676542a",
            "0x9AD122c22B14202B4490eDAf288FDb3C7cb3ff5E",
          ],
        },
        {
          tokens: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',   // USDC
          holders: [
            "0xd96f2B1c14Db8458374d9Aca76E26c3D18364307",
            "0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D",
            "0xD691F27f38B395864Ea86CfC7253969B409c362d",
          ],
        },
        {
          tokens: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',   // WBTC
          holders: [
            "0x178169B423a011fff22B9e3F3abeA13414dDD0F1",
            "0x610B717796ad172B316836AC95a2ffad065CeaB4",
            "0xbB93e510BbCD0B7beb5A853875f9eC60275CF498",
          ],
        },
        {
          tokens: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',   // cDAI
          holders: [
            "0x22aaA7720ddd5388A3c0A3333430953C68f1849b",
            "0x03893a7c7463AE47D46bc7f091665f1893656003",
            "0x2717c5e28cf931547B621a5dddb772Ab6A35B701",
            "0xD21be7248e0197Ee08E0c20D4a96DEBdaC3D20Af",
          ],
        },
      ])
}