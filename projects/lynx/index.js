const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  linea: {
    tokenAndOwnerPair: [
      [
        // veLVC Token
        "0xcc22F6AA610D1b2a0e89EF228079cB3e1831b1D1",
        // OFTChipAdapter (owner)
        "0xc5e782e2a4e2cfcb7ed454cf5a7b6aa2bb424b90",
      ],
    ],
  },
  mode: {
    tokenAndOwnerPair: [
      [
        // MODE Token
        "0xDfc7C877a950e49D2610114102175A06C2e3167a",
        // OFTChipAdapter (owner)
        "0x3b7ED1cDF0Fc64d95c0D0428b9Cc99b6A9a5CB94",
      ],
    ],
  },
  fantom: {
    tokenAndOwnerPair: [
      [
        // WFTM Token
        ADDRESSES.fantom.WFTM,
        // OFTChipAdapter (owner)
        "0x614aA983f54409D475aeC5D18120FECFD6320eF4"
      ],
      [
        // FTM Token
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        // OFTChipAdapter (owner)
        "0x614aA983f54409D475aeC5D18120FECFD6320eF4"
      ],
      [
        // USDC Token
        ADDRESSES.fantom.USDC,
        // OFTChipAdapter (owner)
        "0x194609ea1C1D77e66eaB28C48CE266A48f3bC30a",
      ],
      [
        // FSONIC Token
        "0x05e31a691405d06708a355c029599c12d5da8b28",
        // OFTChipAdapter (owner)
        "0xCCC0d9d276176FED7E6918dCf99F23DCAaCFcAc5"
      ],
      [
        // BRUSH Token
        "0x85dec8c4b2680793661bca91a8f129607571863d",
        // OFTChipAdapter (owner)
        "0xcbd1a63a84af4baa9541331420ff98d8fca3ba1c",
      ],
      [
        // POLTER Token
        "0x5c725631FD299703D0A74C23F89a55c6B9A0C52F",
        // OFTChipAdapter (owner)
        "0x089cd8ac58d9a1488b3cdfdfeb20963e7bb33732",
      ],
      [
        // fBUX Token
        "0x1e2Ea3f3209D66647f959CF00627107e079B870d",
        // OFTChipAdapter (owner)
        "0x86facb048fee156a16104531bd36cdff118d8107",
      ],
      [
        // fTAILS Token
        "0x5cF90b977C86415a53CE3B7bE13b26f6abdDfee2",
        // OFTChipAdapter (owner)
        "0x2c241eefc4b61ed475d7f1ded112df99e5de0e8f",
      ],
    ],
  },
  fuse: {
    tokenAndOwnerPair: [
      [
        // WFUSE Token
        ADDRESSES.fuse.WFUSE,
        // OFTChipAdapter (owner)
        "0x962FD1B229c8c775bC2E37A8a90dac4f3C0105B7",
      ],
      [
        // MST Token
        "0x2363Df84fDb7D4ee9d4E1A15c763BB6b7177eAEe",
        // OFTChipAdapter (owner)
        "0x028815b56433a4AAe10087290d1Ed9Ef7437068F",
      ],
      [
        // sFUSE Token
        "0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871",
        // OFTChipAdapter (owner)
        "0x707f3d554B47E17F1FDfb408FE091B39D51929CF",
      ],
      [
        // VOLT Token
        "0xC5E782E2A4E2cFCb7eD454CF5a7b6aa2bB424B90",
        // OFTChipAdapter (owner)
        "0x094DE4d315198Df981D3a20ceFc3381B2182a572",
      ],
    ],
  },
  arbitrum: {
    tokenAndOwnerPair: [
      [
        // stEUR Token
        ADDRESSES.celo.STEUR,
        // OFTChipAdapter (owner)
        "0xc5e782e2a4e2cfcb7ed454cf5a7b6aa2bb424b90",
      ],
      [
        // TST Token
        "0xf5a27e55c748bcddbfea5477cb9ae924f0f7fd2e",
        // OFTChipAdapter (owner)
        "0xd22c72ab0f4967edb876d84773bff0b60a92e51a",
      ],
      [
        // EUROs Token
        "0x643b34980e635719c15a2d4ce69571a258f940e9",
        // OFTChipAdapter (owner)
        "0x3552fe61af3f6d3235dd1cb75402d4281d1fbac6",
      ],
      [
        // GRAI Token
        "0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487",
        // OFTChipAdapter (owner)
        "0xBe1fa4177fBf43683434CecD5563DA6Ea00FD474",
      ],
    ],
  },
  optimism: {
    tokenAndOwnerPair: [
      [
        // SONNE Token
        "0x1db2466d9f5e10d7090e7152b68d62703a2245f0",
        // OFTChipAdapter (owner)
        "0xc5e782e2a4e2cfcb7ed454cf5a7b6aa2bb424b90",
      ],
    ],
  },
  polygon: {
    tokenAndOwnerPair: [
      [
        // MAI Token
        "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
        // OFTChipAdapter (owner)
        "0x7279d1cff1510e503b6be64fbbad64088034504c",
      ],
      [
        // WMATIC Token
        ADDRESSES.polygon.WMATIC_2,
        // OFTChipAdapter (owner)
        "0x028815b56433a4aae10087290d1ed9ef7437068f",
      ],
    ],
  },
  mantle: {
    tokenAndOwnerPair: [
      [
        // aUSD Token
        "0xD2B4C9B0d70e3Da1fBDD98f469bD02E77E12FC79",
        // OFTChipAdapter (owner)
        "0xC5E782E2A4E2cFCb7eD454CF5a7b6aa2bB424B90",
      ],
    ],
  },
  bsc: {
    tokenAndOwnerPair: [
      [
        // lisUSD Token
        "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
        // OFTChipAdapter (owner)
        "0x3b7ed1cdf0fc64d95c0d0428b9cc99b6a9a5cb94",
      ],
    ],
  },
};

Object.keys(config).forEach((chain) => {
  const { tokenAndOwnerPair } = config[chain];
  module.exports[chain] = {
    tvl: sumTokensExport({
      tokensAndOwners: tokenAndOwnerPair,
    }),
  };
});
