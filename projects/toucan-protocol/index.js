const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const CONFIG_DATA = {
    base: {
        char: "0x20b048fA035D5763685D695e66aDF62c5D9F5055",
    },
    celo: {
        bct: "0x0CcB0071e8B8B716A2a5998aB4d97b83790873Fe",
        nct: ADDRESSES.celo.NCT,
        char: "0x50E85c754929840B58614F48e29C64BC78C58345",
    },
    polygon: {
        bct: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
        nct: "0xD838290e877E0188a4A44700463419ED96c16107",
    },
    regen: {
        nct_bridge: "0xdC1Dfa22824Af4e423a558bbb6C53a31c3c11DCC"
    },
};
const TOKEN_DATA = {
    bct: {
        coingecko: "toucan-protocol-base-carbon-tonne",
        validUntil: 1709828986,
    },
    nct: {
        coingecko: "toucan-protocol-nature-carbon-tonne",
    },
    char: {
        coingecko: "biochar",
    },
};

const getCalculationMethod = (chain) => {
  return async (api,) => {
    const supplyCalls = []
    const tokenInfo = []
    Object.keys(CONFIG_DATA[chain]).map((key) => {
      supplyCalls.push(CONFIG_DATA[chain][key]);
      tokenInfo.push(TOKEN_DATA[key]);
    })

    const resp = await api.multiCall({ abi: 'erc20:totalSupply', calls: supplyCalls, })
    const tokensArray = resp.map((obj, i) => {
      const validUntil = tokenInfo[i].validUntil
      if (validUntil && api.timestamp > validUntil)
        tokenInfo[i].totalSupply = 0
      else
        tokenInfo[i].totalSupply = obj
  
      return {
        [tokenInfo[i].coingecko]: dropDecimals(tokenInfo[i].totalSupply),
      };
    });

    const tokens = tokensArray.reduce((acc, cur) => {
      for (const entry of Object.entries(cur)) {
        const [key, value] = entry;
        acc[key] = value;
      }
      return acc;
    } , {});

    return tokens;
  };
};

const dropDecimals = (num) => {
  return (num ?? 0) / 1e18;
}

const getRegenCredits = () => {
  return async () => {
    const transferred = (await sdk.api.abi.call({
      abi: 'uint256:totalTransferred',
      target: CONFIG_DATA['regen'].nct_bridge,
      chain: 'polygon',
    })).output;

    return {
      'toucan-protocol-nature-carbon-tonne': transferred / 1e18,
    };
  };
};

module.exports = {
  start: '2021-10-21',
  base: {
    tvl: getCalculationMethod("base")
  },
  celo: {
    tvl: getCalculationMethod("celo")
  },
  polygon: {
    tvl: getCalculationMethod("polygon")
  },
  regen: {
    tvl: getRegenCredits()
  },
  hallmarks: [
    ['2022-05-24', "Verra prohibits tokenization"], ['2024-03-07', "BCT administrative control transferred to KlimaDAO"],
  ]
};
