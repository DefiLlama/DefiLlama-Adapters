const abiLci = require("./abiLci.json");

const config = {
  bsc: {
    vaults: {
      LCIBsc: "0x8FD52c2156a0475e35E0FEf37Fa396611062c9b6",
    }
  },
  aurora: {
    vaults: {
      BNIAurora: "0x72eB6E3f163E8CFD1Ebdd7B2f4ffB60b6e420448",
    }
  },
  polygon: {
    vaults: {
      BNIPolygon: "0xF9258759bADb75a9eAb16933ADd056c9F4E489b6",
    }
  },
  avax: {
    vaults: {
      MWIAvalanche: "0x5aCBd5b82edDae114EC0703c86d163bD0107367c",
      BNIAvalanche: "0xe76367024ca3AEeC875A03BB395f54D7c6A82eb0",
    }
  },
}


module.exports = {
  misrepresentedTokens: true,
  methodology: "We count total value in different strategy vaults",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = Object.values(config[chain].vaults)
      const balances = await api.multiCall({ abi: "uint256:getAllPoolInUSD", calls: vaults, })
      api.addUSDValue(balances.reduce((acc, i) => acc + +Math.round(i / 1e18), 0))
    }
  }
})
