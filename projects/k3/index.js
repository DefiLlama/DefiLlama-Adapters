const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by K3 Capital.',
  blockchains: {
    bsc: {
      euler: [
        '0x8E01DB38a409D6E6B8A81fd21d84E05912e8730A',
        '0xca522ECab584b5430ADb946edEE4224A63628362',
        '0x10888BD509aC3e1f423D171008288462988827d5',
        '0x78F5d9909163695dfB064d55A222E398918e00a3',
        '0x470379C4416300068E9Afb938b7A0cfF7735d42f',
        '0x9D30f4226D9aBE940F05acAfD456153BD49ba6D9',
        '0x88A81184243c561026973d25384651E6cc0796A4',
        '0x07167e620612069830fdB5289406bB7A1Ddf781c',
        '0x1E55a40c9C7ca76a8671D8366bEC8c5f8754a336',
        '0x8CE379f1e092f0afCef665529F0d86acf92E8Cd4',
        '0x554a419891bD825e47bC132011821dE1070c35C0',
        '0xA3031755F95E57E1AC9Bb01dBfEb135d40b6DA96',
      ],
    },
    avax: {
      euler: [
        '0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E',
        '0x5030183B3DD0105d69D7d45595C120Fc4b542EC3',
        '0x6072A6d18446278bB5a43eb747de8F61e34cB77f',
        '0x03ef14425CF0d7Af62Cdb8D6E0Acb0b0512aE35C',
        '0x4d758aB40Abb122402F01e1ec4C71ACb06A1f620',
        '0xe91841F707936faf515ff6d478624A325A4f9199',
        '0x38eA4c0724b20B02e5fdE235F657a3aFc184f5aC',
        '0x6fC9b3a52944A577cd8971Fd8fDE0819001bC595',
      ],
    },
    bob: {
      euler: [
        '0xf168679179AA9b6E7772C8eCa4F8afB0B75ED346',
        '0x80E0d452da8eb37c8db9C8E89103DC92aD477773',
        '0x6f421F025DD9e3EfF6097536b7991029859C888A',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
