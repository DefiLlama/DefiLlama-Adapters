const { getTokenSupplies } = require("../helper/solana");
const fetch = require('node-fetch');

const ASSETS = {
  EVM: {
    ethereum: [
      "0x6d57b2e05f26c26b549231c866bdd39779e4a488", // VNXAU
      "0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3", // VEUR
      "0x79d4f0232A66c4c91b89c76362016A1707CFBF4f"  // VCHF
    ],
    polygon: [
      "0xC8bB8eDa94931cA2F20EF43eA7dBD58E68400400", // VNXAU
      "0xE4095d9372E68d108225c306A4491cacfB33B097", // VEUR
      "0xCdB3867935247049e87c38eA270edD305D84c9AE"  // VCHF
    ],
    avax: [
      "0x7678e162f38ec9ef2Bfd1d0aAF9fd93355E5Fa0b", // VEUR,
      "0x228a48df6819CCc2eCa01e2192ebAFfFdAD56c19"  // VCHF,
    ],
    q: [
      "0xe4fadbbf24f118b1e63d65f1aac2a825a07f7619", // VNXAU
      "0x513f99dee650f529d7c65bb5679f092b64003520", // VEUR
      "0x65b9d36281e97418793f3430793f88440dab68d7"  // VCHF
    ]
  },
  nonEVM: {
    solana: [
      "9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R",// VNXAU
      "C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519",// VNXAU
      "AhhdRu5YZdjVkKR3wbnUDaymVQL2ucjMQ63sZ3LFHsch" // VCHF
    ],
    stellar: [
      "VNXAU-GCKIYYQVIFBIFDRN7BNDNHL3UZSFHT5NHDAISG2N3MWCZY3WNXL3LXN3", // VNXAU
      "VEUR-GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN",  // VEUR
      "VCHF-GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN"   // VCHF
    ]
  }
};

const MAPPINGS = {
  stellar: {
    'VNXAU-GCKIYYQVIFBIFDRN7BNDNHL3UZSFHT5NHDAISG2N3MWCZY3WNXL3LXN3': '0x6d57b2e05f26c26b549231c866bdd39779e4a488',
    'VEUR-GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN': '0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3',
    'VCHF-GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN': '0x79d4f0232A66c4c91b89c76362016A1707CFBF4f'
  },
  q: {
    '0xe4fadbbf24f118b1e63d65f1aac2a825a07f7619': '0x6d57b2e05f26c26b549231c866bdd39779e4a488',
    '0x513f99dee650f529d7c65bb5679f092b64003520': '0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3',
    '0x65b9d36281e97418793f3430793f88440dab68d7': '0x79d4f0232A66c4c91b89c76362016A1707CFBF4f'
  }
};

const fetchStellarSupply = async (asset) => {
  const stellarApi = `https://api.stellar.expert/explorer/public/asset/${asset}`;
  const response = await fetch(stellarApi);
  const { supply } = await response.json();
  return supply / 1e7 * 1e18;  // supply / stellar dec * eth dec
};

const solanaTvl = async (api, assets) => {
  const supplies = await getTokenSupplies(assets)
  api.addTokens(Object.keys(supplies), Object.values(supplies));
};

const stellarTvl = async (api, assets) => {
  const supplies = await Promise.all(assets.map(fetchStellarSupply));
  supplies.forEach((supply, index) => {
    const ethereumAsset = MAPPINGS.stellar[assets[index]];
    api.add(ethereumAsset, supply, { skipChain: true });
  });
};

const evmTvl = (chain, assets) => {
  return async (api) => {
    const totalSupplies = await api.multiCall({ calls: assets, abi: 'erc20:totalSupply' });
    if (chain === 'q') {
      totalSupplies.forEach((supply, index) => {
        const ethereumAsset = MAPPINGS.q[assets[index]];
        api.add(ethereumAsset, supply, { skipChain: true });
      });
    } else {
      api.add(assets, totalSupplies);
    }
  };
};

const nonEvmTvl = (chain, assets) => {
  return async (api) => {
    if (chain === "solana") {
      await solanaTvl(api, assets);
    } else if (chain === "stellar") {
      await stellarTvl(api, assets);
    }
  };
};

const getTvlFunction = (key, chain, assets) => {
  if (key === 'EVM') {
    return evmTvl(chain, assets);
  } else if (key === 'nonEVM') {
    return nonEvmTvl(chain, assets);
  }
};

Object.entries(ASSETS).forEach(([key, chains]) => {
  Object.entries(chains).forEach(([chain, assets]) => {
    module.exports[chain] = {
      tvl: getTvlFunction(key, chain, assets)
    };
  });
});
