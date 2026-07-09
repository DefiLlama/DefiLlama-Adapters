const { getCuratorExport } = require("../helper/curators");
const { mergeExports } = require("../helper/utils");

const configs = {
  methodology:
    "Count all assets are deposited in all vaults curated by K3 Capital.",
  blockchains: {
    ethereum: {
      symbiotic: ["0xdC47953c816531a8CA9E1D461AB53687d48EEA26"],
      eulerVaultOwners: ["0xdD84A24eeddE63F10Ec3e928f1c8302A47538b6B"],
      morphoVaultOwners: ["0xdD84A24eeddE63F10Ec3e928f1c8302A47538b6B"],
      mellow: [
        "0xc65433845ecD16688eda196497FA9130d6C47Bd8",
        "0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26",
      ],
      upshiftV2: [
        "0xAEEb2fB279a5aA837367B9D2582F898a63b06ca1",
        "0x0243755a22E37b835486fdAE9A839523ADABd336",
      ],
      erc4626: [
        "0x50bd66d59911f5e086ec87ae43c811e0d059dd11",
        "0xf5503d3d4bd254c2c17690eed523bcb2935db6de",
        "0x866C6c6627303Be103814150fC0e886BE5D9ea83",
        "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e",
        "0x3b3bDAA4462851621818D2CEBC835E077587147A",
        "0x8f47D9D9d5A8202a5a37c4E41fbDd3146D88A579",
        "0xD8b27CF359b7D15710a5BE299AF6e7Bf904984C2",
        "0x056f3a2E41d2778D3a0c0714439c53af2987718E",
        "0x313603FA690301b0CaeEf8069c065862f9162162",
        "0x328646cdfBaD730432620d845B8F5A2f7D786C01",
        "0x797DD80692c3b2dAdabCe8e30C07fDE5307D48a9",
        "0x998D761eC1BAdaCeb064624cc3A1d37A46C88bA4",
        "0xA28C23a459fF8773EB4dBe0e7250d93F79F1Fe2B",
        "0xbC4B4AC47582c3E38Ce5940B80Da65401F4628f1",
        "0xe846ca062aB869b66aE8DcD811973f628BA82eAf",
        "0xe0a80d35bB6618CBA260120b279d357978c42BCE",
        "0x2daCa71Cb58285212Dc05D65Cfd4f59A82BC4cF6",
        "0x7c280DBDEf569e96c7919251bD2B0edF0734C5A8",
        "0xD5F9aFc441ca3f72B22d0B60d53e55b966c8dE64",
        "0xe1Ce9AF672f8854845E5474400B6ddC7AE458a10",
      ],
    },
    bsc: {
      eulerVaultOwners: [
        "0x5Bb012482Fa43c44a29168C6393657130FDF0506",
        "0x2E28c94eE56Ac6d82600070300d86b3a14D5d71A",
      ],
    },
    bob: {
      eulerVaultOwners: ["0xDb81B93068B886172988A1A4Dd5A1523958a23f0"],
    },
    unichain: {
      morphoVaultOwners: ["0xe34A3fb26B3121F4E68bE89Ea553BaC2149F975d"],
    },
    plasma: {
      eulerVaultOwners: ["0x060DB084bF41872861f175d83f3cb1B5566dfEA3"],
      erc4626: [
        "0x539b2ee4f3a04f33d53c0813f77e65148963f72b",
        "0xAADEA03f6D6F198Bdc9229bD8113aceD19031773",
        "0x767d33217e7d2670695FfE2a104548B780f4F5d8",
        "0x141A6f77ca186861BFB323b07012e80Ef4e09041",
        "0x2F33b4AE409e86c6BEa9E2Bbe98361c19F2A1f0c",
        "0x9d86B4fc23D8438fC4Aba58642DC35D5F64fE941",
        "0xDa33Ba72A303C26515edE275a2521b469F97D71b",
        "0xFE8d21E64e0c6CFb9abF224e805452acdE8e91Fa",
        "0xfc5c4e5593A352CEDc9E5D7fD4e21b321140c345",
      ],
    },
    arbitrum: {
      eulerVaultOwners: ["0xAeE4e2E8024C1B58f4686d1CB1646a6d5755F05C"],
    },
    optimism: {
      midasTokens: [
        "0xcC476B1a49bcDf5192561e87b6Fb8ea78aa28C13",
      ],
    },
    monad: {
      accountableVaults: [
        "0x77410132Fd468d67B820314d378bE1fDbfA2bAa4",
      ],
      erc4626: [
        "0x1E4D67c666c2Ccf27A0aF980fE6c8e0f05aC8949",
        "0x502e4a0B61dEBA3015Eb9E51116B832003B22c2C",
        "0x61788859B923989dFeb995b8DE5CbBcD719475e9",
        "0x870E172C3C7Ea274Ce60fB8D19D86012edc3C043",
        "0x8c75A7177D64167E6EbC65A1D25d03CbF726fc46",
        "0xb72E0659417bbB1eA55869Ab2f81cb41e751938f",
        "0x0F9bA9d0f2F9289efBC2b8505932b458C3CDCf64",
        "0x70023EF5e6Fb65fA133288E9826CBea3b173dD67",
        "0xa3B64e2674463c98CbD21807055D8C1E008b6e79",
        "0x21Bf777668Bae755f00e49fb1D58112094AD4855",
        "0x9eA1b948186F9A8cfe375278d96363103f4fa42B",
        "0x3fE40329061A40f95416da42bB69E15d8eb83740",
        "0xA8f093Cfb04a536Dbc6aa9BB94A2D617305a48F3",
        "0x7B4BcAEAC5Eb67ae947903F24BBa660eE06A5231",
        "0x5792753b66Eb5213E416755546abBcC1AEF1008A",
        "0xb6A4db1FeF7831F65827d9aF2Cb1e69F764eC123",
        "0x9109529c3a2EB36DE0AC3837baeA74044863C60a",
        "0x36d0f0A4cB615C200310aE2c5b5D345189d01197",
        "0xDDffd6801a86b598077aDdda04F70aF08b6f8807",
        "0x52A59afAF5CB7CB09F94056fD631688D659A33B6",
        "0xF19E8Ddc541dEE2F4D6796a79b1C1E10A415a0Da",
        "0x28bD4F19C812CBF9e33A206f87125f14E65dc8aA",
        "0x6661a2b4008b70f22Ff84c2134ac6F51534E162d",
        "0x6E06ce28a6C28bffa274Ead5cb715992033E351A",
        "0x240FcAFffF24AAa39e420B6F70ED5519847648b4",
      ],
    },
  },
};


// EulerDAO sunset its dao curated markets and handed several vaults to K3.
// Pre-sunset these vaults count under projects/euler-dao, from the sunset date
// onward they are attributed to K3.
// https://forum.euler.finance/t/sunsetting-of-dao-managed-market-and-vaults/1828
const eulerSunsetConfigs = getCuratorExport({
  start: "2026-05-06",
  blockchains: {
    monad: {
      eulerVaultOwners: ["0x5D42F8aCd567810D57D60f90bB9C6d194207a6e1"],
    },
  },
});

module.exports = mergeExports([getCuratorExport(configs), eulerSunsetConfigs]);