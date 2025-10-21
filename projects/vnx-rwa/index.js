const { getTokenSupplies } = require("../helper/solana");
const { get } = require("../helper/http");

const ASSETS = {
  EVM: {
    ethereum: [
      "0x6d57b2e05f26c26b549231c866bdd39779e4a488", // VNXAU
      "0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3", // VEUR
      "0x79d4f0232A66c4c91b89c76362016A1707CFBF4f", // VCHF
      "0x34c9c643becd939c950bb9f141e35777559817cb"  // VGBP
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
    ],
    arbitrum: [
      "0x4883C8f0529F37e40eBeA870F3C13cDfAD5d01f8", // VEUR
      "0x02cea97794D2cFB5f560e1fF4e9C59D1BEC75969", // VCHF
    ],
    base: [
      "0xAc3FE22294beaED9d1FD752323a6d06D12Ff3098", // VNXAU
      "0x4ed9Df25d38795a47f52614126e47f564D37F347", // VEUR
      "0x1fcA74D9ef54a6AC80ffE7D3b14e76c4330Fd5D8", // VCHF
      "0xAEB4bb7DebD1E5e82266f7c3b5cFf56B3A7BF411"  // VGBP
    ],
    celo:[
      "0x9346F43c1588B6DF1D52bdD6Bf846064F92d9Cba", // VEUR
      "0xC5ebEa9984C485EC5D58cA5a2D376620d93aF871", // VCHF
      "0x7aE4265eCFC1F31bc0E112DfCFe3D78E01f4BB7f"  // VGBP
    ],
    fraxtal:[
      "0x4c0BD74Da8237c08840984Fdb33A84B4586aAEe6", // VEUR
      "0x418126BB59457aFDbA1eCF376f97400B4157425D", // VCHF
    ]
  },
  nonEVM: {
    solana: [
      "9TPL8droGJ7jThsq4momaoz6uhTcvX2SeMqipoPmNa8R", // VNXAU
      "C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519", // VNXAU
      "AhhdRu5YZdjVkKR3wbnUDaymVQL2ucjMQ63sZ3LFHsch", // VCHF
      "5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1"  // VGBP
    ],
    stellar: [
      "VNXAU-GCKIYYQVIFBIFDRN7BNDNHL3UZSFHT5NHDAISG2N3MWCZY3WNXL3LXN3", // VNXAU
      "VEUR-GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN",  // VEUR
      "VCHF-GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN"   // VCHF
    ],
    icp: [
      "wu6g4-6qaaa-aaaan-qmrza-cai", // VEUR
      "ly36x-wiaaa-aaaai-aqj7q-cai"  // VCHF
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
  },
  icp: {
    'wu6g4-6qaaa-aaaan-qmrza-cai': '0x6bA75D640bEbfe5dA1197bb5A2aff3327789b5d3', //VEUR
    'ly36x-wiaaa-aaaai-aqj7q-cai': '0x79d4f0232A66c4c91b89c76362016A1707CFBF4f' //VCHF
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
    api.add(`ethereum:${ethereumAsset}`, supply, { skipChain: true });
  });
};

const evmTvl = (chain, assets) => {
  return async (api) => {
    const totalSupplies = await api.multiCall({ calls: assets, abi: 'erc20:totalSupply' });
    if (chain === 'q') {
      totalSupplies.forEach((supply, index) => {
        const ethereumAsset = MAPPINGS.q[assets[index]];
        api.add(`ethereum:${ethereumAsset}`, supply, { skipChain: true });
      });
    } else {
      api.add(assets, totalSupplies);
    }
  };
};

const fetchIcpSupply = async (asset) => {
  const url = `https://${asset}.raw.icp0.io/metrics`;
  let response = await get(url);
  // Extract ledger_total_supply from the response
  const lines = response.split('\n');
  let totalSupply = 0;
  for (const line of lines) {
    if (line.startsWith('ledger_total_supply')) {
      const parts = line.split(' ');
      if (parts.length >= 2) {
        totalSupply = parseInt(parts[1]);
        break;
      }
    }
  }
  return totalSupply / 1e8 * 1e18; // Convert to 18 decimals for Ethereum compatibility
};

const icpTvl = async (api, assets) => {
  const totalSupply = await Promise.all(assets.map(fetchIcpSupply));
  totalSupply.forEach((supply, index) => {
    const ethereumAsset = MAPPINGS.icp[assets[index]];
    api.add(`ethereum:${ethereumAsset}`, supply, { skipChain: true });
  });
};

const nonEvmTvl = (chain, assets) => {
  return async (api) => {
    if (chain === "solana") {
      await solanaTvl(api, assets);
    } else if (chain === "stellar") {
      await stellarTvl(api, assets);
    } else if (chain === "icp") {
      await icpTvl(api, assets);
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
