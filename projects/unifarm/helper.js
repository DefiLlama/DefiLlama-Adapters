const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const v1Data = require('./v1Data.json')

const chainIds = { ethereum: 1, bsc: 56, polygon: 137, }
const chains = Object.keys(chainIds)

async function getAllV1Data() {
  return v1Data
}

const liquidityContract = {
  ethereum: "0xD13dF6B426358C2471bC6dea75167c3c106Ef881",
  bsc: "0x7423Af05D11e7363cF5Ea5Ef2eA55c7E7AEA3f7a",
  polygon: "0x62CEfDaDd37C8169034b2efD4401bc770B7B92D3",
};

const UFARM = {
  ethereum: "0x40986a85b4cfcdb054a6cbfb1210194fee51af88", //Ufarm ethereum
  bsc: "0x0a356f512f6fce740111ee04ab1699017a908680", // ufarm BSC
  polygon: "0xa7305ae84519ff8be02484cda45834c4e7d13dd6", //ufarm Polygon
  avax: "0xd60effed653f3f1b69047f2d2dc4e808a548767b", // ufarm avax
};

const ORO = {
  ethereum: "0xc3eb2622190c57429aac3901808994443b64b466", // ethereum
  bsc: "0x9f998d62B81AF019E3346AF141f90ccCD679825E", //BSC
};

const v2Query = `
query MyQuery {
  cohorts {
    cohortVersion
    numberOfFarms,
    id,
    tokens {
      decimals
      farmToken
      fid
    }
  }
}
`;

const v2EndPoints = {
  ethereum: sdk.graph.modifyEndpoint('Cquw1hbmvNrSvUjaqoRhu9nWv7AX1Mz2gEb9sapYdMA5'),
  polygon: sdk.graph.modifyEndpoint('Ami8CcwigwYViJsUrwqK8DWwDPtFVAKbeYfii6ANahax'),
  bsc: sdk.graph.modifyEndpoint('EsA5LyABgi7ibZJGNr5PQsQ2L8QDPZxNdDvd5qPs5CJj'),
}

const getV1Calls = async (chain) => {
  const { pools } = (await getAllV1Data())[chain]
  const calls = []
  for (const { cohort: { cohortAddress, tokens, proxies } } of pools) {
    tokens.forEach(t => {
      calls.push([t, cohortAddress])
      proxies.forEach(p => calls.push([t, p]))
    })
  }
  return calls
};

const getV2Calls = async (chain) => {
  const { cohorts } = await cachedGraphQuery('unifarm/'+chain, v2EndPoints[chain], v2Query)
  let calls = [];
  for (let i = 0; i < cohorts.length; i++) {
    const owner = cohorts[i].id
    cohorts[i].tokens.forEach(i => calls.push([i.farmToken, owner]))
  }

  return calls;
};

const createCallForSetu = (chain) => {
  let calls = [[UFARM[chain], liquidityContract[chain]]];
  if (chain === "ethereum" || chain === "bsc")
    calls.push([ORO[chain], liquidityContract[chain]])
  return calls;
};

module.exports = {
  getV2Calls,
  createCallForSetu,
  chains,
  getV1Calls,
};
