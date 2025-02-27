const { sumTokens2 } = require("../helper/unwrapLPs");

const CONFIG = {
  base: {
    fromBlock: 5314581,
    controller: "0xfbF069Dbbf453C1ab23042083CFa980B3a672BbA",
  },
  fantom: {
    fromBlock: 69969086,
    controller: "0xf37102e11E06276ac9D393277BD7b63b3393b361",
  },
  mantle: {
    fromBlock: 18438182,
    controller: "0x7900f766F06e361FDDB4FdeBac5b138c4EEd8d4A",
  },
  iotaevm: {
    fromBlock: 1936296,
    controller: "0x0E4d23092A4a12caAd0E22e0892EcEC7C09DC51c",
  },
};

const abi = {
  pairs: "function pairs() view returns (address[2][])"
}

const tvl = async (api) => {
  const { controller } = CONFIG[api.chain]
  const tokens = (await api.call({ target: controller, abi: abi.pairs })).flat()
  return sumTokens2({ api, owner: controller, tokens })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})