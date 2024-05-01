const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "TVL counts the AAVE tokens that are deposited within the Yield Instruments section of QiDao, the Vault token deposits of CRV, LINK, AAVE and WETH, as well as USDC deposited to mint MAI.",
};

const config = {
  optimism: {
    vaults: [
      "0x062016cd29fabb26c52bab646878987fc9b0bc55",
      "0xb9c8f0d3254007ee4b98970b94544e473cd610ec",
      "0xbf1aea8670d2528e08334083616dd9c5f3b087ae",
      "0xF9CE2522027bD40D3b1aEe4abe969831FE3BeAf5",
      "0xAB91c51b55F7Dd7B34F2FD7217506fD5b632B2B9",
      "0xB89c1b3d9f335B9d8Bb16016F3d60160AE71041f",
      "0x86f78d3cbca0636817ad9e27a44996c738ec4932",
      "0xa478E708A27853848C6Bc979668fe6225FEe46Fa",
      "0x7198ff382b5798dab7dc72a23c1fec9dc091893b",
      "0xc88c8ada95d92c149377aa660837460775dcc6d9"
    ]
  },
  arbitrum: {
    vaults: [
      "0xC76a3cBefE490Ae4450B2fCC2c38666aA99f7aa0",
      "0xB237f4264938f0903F5EC120BB1Aa4beE3562FfF",
      "0xd371281896f2F5f7A2C65F49d23A2B6ecfd594f3",
      "0xe47ca047Cb7E6A9AdE9405Ca68077d63424F34eC",
      "0xa864956ff961ce62c266a8563b46577d3573372e",
      "0x950eceee9e7d7366a24fc9d2ed4c0c37d17a0fa9"
    ]
  },
  fantom: {
    vaults: [
      "0x1066b8FC999c1eE94241344818486D5f944331A0",
      "0x7efB260662a6FA95c1CE1092c53Ca23733202798",
      "0x682E473FcA490B0adFA7EfE94083C1E63f28F034",
      "0xD939c268C49c442F037E968F045ba02f499562D4",
      "0xE5996a2cB60eA57F03bf332b5ADC517035d8d094",
      "0x267bDD1C19C932CE03c7A62BBe5b95375F9160A6",
      "0xd6488d586E8Fcd53220e4804D767F19F5C846086",
      "0xdB09908b82499CAdb9E6108444D5042f81569bD9",
      "0x3609A304c6A41d87E895b9c1fd18c02ba989Ba90",
      "0xC1c7eF18ABC94013F6c58C6CdF9e829A48075b4e",
      "0x5563Cc1ee23c4b17C861418cFF16641D46E12436",
      "0x8e5e4D08485673770Ab372c05f95081BE0636Fa2",
      "0xBf0ff8ac03f3E0DD7d8faA9b571ebA999a854146",
      // "0x051b82448a521bC32Ac7007a7A76F9dEC80F6BA2",
      // "0xD60FBaFc954Bfbd594c7723C980003c196bDF02F",
      // "0xCB99178C671761482097F32595cb79fb28a49Fd8",
      "0x7aE52477783c4E3e5c1476Bbb29A8D029c920676",
      "0x571F42886C31f9b769ad243e81D06D0D144BE7B4",
      "0x6d6029557a06961aCC5F81e1ffF5A474C54e32Fd",
      "0x3f6cf10e85e9c0630856599fab8d8bfcd9c0e7d4",
      "0x75D4aB6843593C111Eeb02Ff07055009c836A1EF",
      // "0xf18F4847a5Db889B966788dcbDbcBfA72f22E5A6",
      // "0xedF25e618E4946B05df1E33845993FfEBb427A0F",
      "0xF34e271312e41Bbd7c451B76Af2AF8339D6f16ED",
      "0x7aE52477783c4E3e5c1476Bbb29A8D029c920676",
      "0x571F42886C31f9b769ad243e81D06D0D144BE7B4",
      "0x6d6029557a06961aCC5F81e1ffF5A474C54e32Fd",
    ],
  },
  avax: {
    vaults: [
      "0xfA19c1d104F4AEfb8d5564f02B3AdCa1b515da58",
      // "0xC3537ef04Ad744174A4A4a91AfAC4Baf0CF80cB3",
      // "0xF8AC186555cbd5104c0e8C5BacF8bB779a3869f5",
      // "0xEa88eB237baE0AE26f4500146c251d25F409FA32",
      // "0x8Edc3fB6Fcdd5773216331f74AfDb6a2a2E16dc9",
      //"0x13a7fe3ab741ea6301db8b164290be711f546a73",
      "0x73a755378788a4542a780002a75a7bae7f558730",
      "0xa9122dacf3fccf1aae6b8ddd1f75b6267e5cbbb8",
      "0x1f8f7a1d38e41eaf0ed916def29bdd13f2a3f11a",
    ]
  },
  moonbeam: {
    vaults: [
      "0x3A82F4da24F93a32dc3C2A28cFA9D6E63EC28531",
    ]
  },
  moonriver: {
    vaults: [
      // "0x97D811A7eb99Ef4Cb027ad59800cE27E68Ee1109",
      //"0x4a0474E3262d4DB3306Cea4F207B5d66eC8E0AA9",
    ]
  },
  harmony: {
    vaults: [
      //"0x12FcB286D664F37981a42cbAce92eAf28d1dA94f",
      //"0x46469f995A5CB60708200C25EaD3cF1667Ed36d6",
    ]
  },
  xdai: {
    vaults: [
      "0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b",
      "0x014a177e9642d1b4e970418f894985dc1b85657f",
    ]
  },
  base: {
    vaults: [
      "0x7333fd58d8d73a8e5fc1a16c8037ada4f580fa2b",
      "0x8d6cebd76f18e1558d4db88138e2defb3909fad6",
      "0x654a31ba7d714cfcab19b17d0066171c1a292349",
      "0x20658fDaBD4C79F1B3666E5bcCAeF78b5059B109"
    ],
    psm: ["0x83D41737d086033A9c3acE2F1Ad9350d7d91cf02",],
  },
  linea: {
    vaults: [
      "0x8ab01c5ee3422099156ab151eecb83c095626599",
      "0x7f9dd991e8fd0cbb52cb8eb35dd35c474a9a7a70"
    ],
    psm: ["0x2f5cedaff534cc816ed6f551eb2b73d6f1daa440"],
  },
  ethereum: {
    vaults: [
      "0x60d133c666919B54a3254E0d3F14332cB783B733",
      "0xEcbd32bD581e241739be1763DFE7a8fFcC844ae1",
      "0x98eb27E5F24FB83b7D129D789665b08C258b4cCF",
      "0x8C45969aD19D297c9B85763e90D0344C6E2ac9d1",
      "0xcc61Ee649A95F2E2f0830838681f839BDb7CB823",
      "0x82E90EB7034C1DF646bD06aFb9E67281AAb5ed28",
      "0xCA3EB45FB186Ed4e75B9B22A514fF1d4abAdD123",
      "0x4ce4C542D96Ce1872fEA4fa3fbB2E7aE31862Bad",
      "0x5773e8953cf60f495eb3c2db45dd753b5c4b7473",
      "0x954ac12c339c60eafbb32213b15af3f7c7a0dec2"
    ]
  },
  bsc: {
    vaults: [
      "0x014a177e9642d1b4e970418f894985dc1b85657f",
      "0xa56f9a54880afbc30cf29bb66d2d9adcdcaeadd6",
      "0x7333fd58d8d73a8e5fc1a16c8037ada4f580fa2b",
    ]
  },
  metis: {
    vaults: [
      "0x10dcbee8afa39a847707e16aea5eb34c6b01aba9",
      "0xc09c73f7b32573d178138e76c0e286ba21085c20",
      "0xb89c1b3d9f335b9d8bb16016f3d60160ae71041f",
      "0x5A03716bd1f338D7849f5c9581AD5015ce0020B0",
      "0x19Cb63CCbfAC2f28B1fd79923f6aDfC096e6EBB4"
    ]
  },
  polygon: {
    vaults: [
      "0x3fd939B017b31eaADF9ae50C7fF7Fa5c0661d47C",
      "0x61167073E31b1DAd85a3E531211c7B8F1E5cAE72",
      "0x87ee36f780ae843A78D5735867bc1c13792b7b11",
      "0x98B5F32dd9670191568b661a3e847Ed764943875",
      "0x37131aEDd3da288467B6EBe9A77C523A700E6Ca1",
      "0x701A1824e5574B0b6b1c8dA808B184a7AB7A2867",
      "0x649Aa6E6b6194250C077DF4fB37c23EE6c098513",
      "0xF086dEdf6a89e7B16145b03a6CB0C0a9979F1433",
      "0xff2c44fb819757225a176e825255a01b3b8bb051",
      "0x178f1c95c85fe7221c7a6a3d6f12b7da3253eeae",
      "0x1dcc1f864a4bd0b8f4ad33594b758b68e9fa872c",
      "0x305f113ff78255d4f8524c8f50c7300b91b10f6a",
      "0x7d36999a69f2B99BF3FB98866cBbE47aF43696C8",
      "0x506533B9C16eE2472A6BF37cc320aE45a0a24F11",
      "0x7CbF49E4214C7200AF986bc4aACF7bc79dd9C19a",
      "0xaa19d0e397c964a35e6e80262c692dbfc9c23451",
      "0x11826d20b6a16a22450978642404da95b4640123",
      "0x34fa22892256216a659d4f635354250b4d771458",
      "0x7d75F83f0aBe2Ece0b9Daf41CCeDdF38Cb66146b",
      "0x57cbf36788113237d64e46f25a88855c3dff1691",
      "0x1f0aa72b980d65518e88841ba1da075bd43fa933",
      "0x9A05b116b56304F5f4B3F1D5DA4641bFfFfae6Ab",
      "0xF1104493eC315aF2cb52f0c19605443334928D38",
      "0xb1f28350539b06d5a35d016908eef0424bd13c4b",
      "0x3bcbAC61456c9C9582132D1493A00E318EA9C122",
      "0x169d47043cc0c94c39fa327941c56cb0344dc508",
      "0xb5b31e6a13ae856bc30b3c76b16edad9f432b54f"
    ],
    toa: [
      [nullAddress, '0xa3fa99a148fa48d14ed51d610c367c61876997f1'],
      // vaults
      [
        "0x1a13f4ca1d028320a707d99520abfefca3998b7f",
        "0x22965e296d9a0Cd0E917d6D70EF2573009F8a1bB",
      ], //amUSDC
      [
        "0x27f8d03b3a2196956ed754badc28d73be8830a6e",
        "0xE6C23289Ba5A9F0Ef31b8EB36241D5c800889b7b",
      ], //amDAI
      [
        "0x28424507fefb6f7f8e9d3860f56504e4e5f5f390",
        "0x0470CD31C8FcC42671465880BA81D631F0B76C1D",
      ], //amWETH
      [
        "0x60d55f02a771d515e077c9c2403a1ef324885cec",
        "0xB3911259f435b28EC072E4Ff6fF5A2C604fea0Fb",
      ], //amUSDT
      [
        "0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4",
        "0x7068Ea5255cb05931EFa8026Bd04b18F3DeB8b0B",
      ], //amMATIC
      [
        "0x1d2a0e5ec8e5bbdca5cb219e649b565d8e5c3360",
        "0xeA4040B21cb68afb94889cB60834b13427CFc4EB",
      ], //amAAVE
      [
        "0x5c2ed810328349100a66b82b78a1791b101c9d61",
        "0xBa6273A78a23169e01317bd0f6338547F869E8Df",
      ], // amWBTC
      // anchor
      [
        ADDRESSES.polygon.USDC,
        "0x947D711C25220d8301C087b25BA111FE8Cbf6672",
      ], //USDC
      [
        ADDRESSES.polygon.USDT,
        "0xa4742A65f24291AA421497221AaF64c70b098d98",
      ], //USDT
      [
        ADDRESSES.polygon.DAI,
        "0x6062E92599a77E62e0cC9749261eb2eaC3aBD44F",
      ], //DAI
    ]
  }
}

Object.keys(config).forEach(chain => {
  const { vaults, toa = [], psm } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:collateral', calls: vaults, })
      const tokensAndOwners = tokens.map((t, i) => ([t, vaults[i]]))
      tokensAndOwners.push(...toa)
      if (psm && psm.length) {
        const underlyings = await api.multiCall({ abi: 'address:underlying', calls: psm })
        const bals = await api.multiCall({ abi: 'uint256:totalStableLiquidity', calls: psm })
        api.add(underlyings, bals)
      }

      return sumTokens2({ tokensAndOwners, api })
    }
  }
})
