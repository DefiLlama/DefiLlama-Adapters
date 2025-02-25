const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  // Engine Chips
  sonic: {
    tokenAndOwnerPair: [
      [
        // wS Token
        ADDRESSES.sonic.wS,
        // EngineChip (owner)
        "0x0e7a7a477ab4dDFB2d7a500D33c38A19372a70Fc"
      ],
      [
        // AG Token
        "0x005851f943ee2957b1748957f26319e4f9edebc1",
        // EngineChip (owner)
        "0x4461913eCa88EDE2d76B576C8fA5D08535bb714A"
      ],
    ]
  },
  fantom: {
    tokenAndOwnerPair: [
      [
        // WFTM Token
        ADDRESSES.fantom.WFTM,
        // EngineChip (owner)
        "0x614aA983f54409D475aeC5D18120FECFD6320eF4"
      ],
      // [
      //   // FTM Token
      //   "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      //   // EngineChip (owner)
      //   "0x614aA983f54409D475aeC5D18120FECFD6320eF4"
      // ],
      [
        // USDC Token
        "0x2F733095B80A04b38b0D10cC884524a3d09b836a",
        // EngineChip (owner)
        "0x194609ea1C1D77e66eaB28C48CE266A48f3bC30a",
      ],
      [
        // SPIRIT Token
        "0x5cc61a78f164885776aa610fb0fe1257df78e59b",
        // EngineChip (owner)
        "0x1401C2C092df468862e23502B88A8795e2e9aecf",
      ],
      [
        // FSONIC Token
        "0x05e31a691405d06708a355c029599c12d5da8b28",
        // EngineChip (owner)
        "0xCCC0d9d276176FED7E6918dCf99F23DCAaCFcAc5"
      ],
      [
        // BRUSH Token
        "0x85dec8c4b2680793661bca91a8f129607571863d",
        // EngineChip (owner)
        "0xCBd1A63A84af4BAA9541331420fF98d8Fca3ba1C",
      ],
      [
        // POLTER Token
        "0x5c725631FD299703D0A74C23F89a55c6B9A0C52F",
        // EngineChip (owner)
        "0x089cD8AC58D9a1488b3cDfDfeb20963e7BB33732",
      ],
      [
        // fBUX Token
        "0x1e2Ea3f3209D66647f959CF00627107e079B870d",
        // EngineChip (owner)
        "0x86fAcB048FEe156A16104531Bd36CDfF118d8107",
      ],
      [
        // fTAILS Token
        "0x5cF90b977C86415a53CE3B7bE13b26f6abdDfee2",
        // EngineChip (owner)
        "0x2c241eeFc4b61ed475d7f1DeD112df99E5De0E8F",
      ],
      [
        // sGOAT Token
        "0x43f9a13675e352154f745d6402e853fecc388aa5",
        // EngineChip (owner)
        "0xa8ddbf9B7E307100ba689C02CC1360112d660206",
      ],
      [
        // EQUAL Token
        "0x3fd3a0c85b70754efc07ac9ac0cbbdce664865a6",
        // EngineChip (owner)
        "0x59698CA79B8568F25294d6Eab6281667712079eE",
      ],
    ],
  },
  boba: {
    tokenAndOwnerPair: [
      [
        // BOBA Token
        ADDRESSES.boba.BOBA,
        // EngineChip (owner)
        "0x9beABD8699E2306c5632C80E663dE9953e104C3f"
      ],
      [
        // USDC Token
        ADDRESSES.boba.USDC,
        // EngineChip (owner)
        "0xcDD339d704Fb8f35A3a2f7d9B064238D33DC7550"
      ],
    ]
  },

  // OFT Chips
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
        ADDRESSES.fuse.SFUSE,
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
  linea: {
    tokenAndOwnerPair: [
      [
        // veLVC Token
        "0xcc22F6AA610D1b2a0e89EF228079cB3e1831b1D1",
        // OFTChipAdapter (owner)
        "0xc5e782e2a4e2cfcb7ed454cf5a7b6aa2bb424b90",
      ],
      [
        // LVC Token
        "0xcc22F6AA610D1b2a0e89EF228079cB3e1831b1D1",
        // OFTChipAdapter (owner)
        "0x55f2f3fA843C1755e17eb5F32D29a35c99a3aF09",
      ],
    ],
  },
  arbitrum: {
    tokenAndOwnerPair: [
      [
        // stEUR Token
        ADDRESSES.arbitrum.ARB,
        // OFTChipAdapter (owner)
        "0x094DE4d315198Df981D3a20ceFc3381B2182a572",
      ],
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
        "0x3552fE61af3F6d3235Dd1CB75402d4281d1FbaC6",
      ],
      [
        // GRAI Token
        "0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487",
        // OFTChipAdapter (owner)
        "0xBe1fa4177fBf43683434CecD5563DA6Ea00FD474",
      ],
      [
        // SLIZ Token
        "0x463913D3a3D3D291667D53B8325c598Eb88D3B0e",
        // OFTChipAdapter (owner)
        "0x1E1F546dF45A82F2a29E709C85331E3974dC26b0",
      ],
      [
        // SCALES Token
        "0xe6af844d5740b6b297b6dd7fb2ce299ee9e3d16f",
        // OFTChipAdapter (owner)
        "0x1E71Fad2d453dAb287Dad8CD003CA24A9d9194EA",
      ],
      [
        // USDFI Token
        "0x249c48e22e95514ca975de31f473f30c2f3c0916",
        // OFTChipAdapter (owner)
        "0x24d6318B87ABB45B62D981693FCF25A5956F41e2",
      ],
      [
        // STABLE Token
        "0x666966ef3925b1c92fa355fda9722899f3e73451",
        // OFTChipAdapter (owner)
        "0x2E2a9b820BDDfD54487f8d5A0Dfd5940D5Dac6A9",
      ],
      [
        // uniBTC Token
        "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a",
        // OFTChipAdapter (owner)
        "0xCf3562bbe462A249a4b2B2a421dF00b93E081066",
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
  polygon: {
    tokenAndOwnerPair: [
      [
        // WMATIC Token
        ADDRESSES.polygon.WMATIC_2,
        // OFTChipAdapter (owner)
        "0x028815b56433a4aae10087290d1ed9ef7437068f",
      ],
      [
        // MIMATIC Token
        "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
        // OFTChipAdapter (owner)
        "0x7279d1cFf1510E503B6Be64fBBAd64088034504C",
      ],
    ],
  },
  bsc: {
    tokenAndOwnerPair: [
      [
        // wBNB Token
        ADDRESSES.bsc.WBNB,
        // OFTChipAdapter (owner)
        "0x67ac4355787fe8313D6cAfd23aEa4463704fBaeC",
      ],
      [
        // USDT Token
        ADDRESSES.bsc.USDT,
        // OFTChipAdapter (owner)
        "0x7eDb95ba0294EfD054221141FcC8f12F2Ada1129",
      ],
      [
        // lisUSD Token
        "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
        // OFTChipAdapter (owner)
        "0x3b7ed1cdf0fc64d95c0d0428b9cc99b6a9a5cb94",
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
      [
        // ION Token
        "0x18470019bF0E94611f15852F7e93cf5D65BC34CA",
        // OFTChipAdapter (owner)
        "0xD22c72aB0f4967edB876d84773BfF0b60A92e51a",
      ],
    ],
  },
  celo: {
    tokenAndOwnerPair: [
      [
        // CELO Token
        ADDRESSES.celo.CELO,
        // OFTChipAdapter (owner)
        "0x7279d1cFf1510E503B6Be64fBBAd64088034504C",
      ],
      [
        // USDT Token
        ADDRESSES.celo.USDT_1,
        // OFTChipAdapter (owner)
        "0xA36cB6e644cCE5fB98bDa9aa538927B2c934D8fa",
      ],
    ]
  },
  zircuit: {
    tokenAndOwnerPair: [
      [
        // ZRC Token
        "0xfd418e42783382e86ae91e445406600ba144d162",
        // OFTChipAdapter (owner)
        "0xa624818151078Ccc936BF056DEf51114808BFE16",
      ],
    ]
  },
  ethereum: {
    tokenAndOwnerPair: [
      [
        // WEETh Token
        ADDRESSES.ethereum.WEETH,
        // OFTChipAdapter (owner)
        "0x66Aaf6Da70dA10aC8dC024E668edcade1C8F5b44",
      ],
      [
        // TUNA Token
        "0xadd353fb2e2c563383ff3272a500f3e7134dafe4",
        // OFTChipAdapter (owner)
        "0x3b7ED1cDF0Fc64d95c0D0428b9Cc99b6A9a5CB94",
      ],
    ],
  }
};

Object.keys(config).forEach((chain) => {
  const { tokenAndOwnerPair } = config[chain];
  module.exports[chain] = {
    tvl: sumTokensExport({
      tokensAndOwners: tokenAndOwnerPair,
    }),
  };
});
