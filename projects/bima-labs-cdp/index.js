const { addressZero } = require("../bent/constants");
const { getLogs } = require("../helper/cache/getLogs");
const bitcoinBook = require('../helper/bitcoin-book');
const { sumTokens } = require("../helper/chain/bitcoin");

const config = {
  ethereum: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 22095715,
    psmList: [
      "0xEA811C2C400EE846E352D45C849657D920A888fe",
      "0x97bb3167A88FE34B1EC6d7F02560c4F0aa6009E9",
      "0x42Ad6834a6599a0B7a7812F01f8092B580523d67",
      "0x705fd2306bf6E4dec47bF8Aaab378B04024792d4",
    ],
  },
  hemi: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 1391406,
    psmList: [],
  },
  core: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 23086081,
    psmList: [],
  },
  sonic: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 23769061,
    psmList: [],
  },
  plume_mainnet: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 1219008,
    psmList: [],
  },
  goat: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 3742120,
    psmList: [],
  },
  bsc: {
    factory: "0xc5790164d3CCB6533b241EeE3Fd7f56862759376",
    wrapperFactory: "0x76De9B5Df6dCAA70f88E4E0949E17367c4129Dbf",
    fromBlock: 50108286,
    psmList: [],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: config[chain].factory,
        eventAbi:
          "event NewDeployment (address collateral, address priceFeed, address troveManager, address sortedTroves)",
        onlyArgs: true,
        fromBlock: config[chain].fromBlock,
      });

      const tokensAndOwners = [];

      for (const log of logs) {
        const underlyingCollateral = await api.call({
          abi: "function wrappedCollToColl(address wrapped) view returns (address)",
          target: config[chain].wrapperFactory,
          params: [log.collateral],
        });

        if (underlyingCollateral === addressZero) {
          tokensAndOwners.push([log.collateral, log.troveManager]);
        } else {
          tokensAndOwners.push([underlyingCollateral, log.collateral]);
        }
      }

      for (const psm of config[chain].psmList) {
        const underlyingToken = await api.call({
          abi: "function underlying() view returns (address)",
          target: psm,
        });

        tokensAndOwners.push([underlyingToken, psm]);
      }

      return api.sumTokens({ tokensAndOwners });
    },
  };
});

module.exports.bitcoin = { tvl: async (api) => sumTokens({ owners: bitcoinBook.bimaCdp }) }