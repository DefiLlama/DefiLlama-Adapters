const sdk = require('@defillama/sdk')
const { CONFIG_DATA, TOKEN_DATA } = require("./config");

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
    [1653429600, "Verra prohibits tokenization"], [1709828986, "BCT administrative control transferred to KlimaDAO"],
  ]
};
