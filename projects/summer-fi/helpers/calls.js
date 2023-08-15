const { sliceIntoChunks } = require("@defillama/sdk/build/util/index.js");
const abi = require("../constants/abi.js");
const contracts = require("../constants/contracts.js");
const sdk = require("@defillama/sdk");

const getCdpData = async (cdpIds, api) => {
  const res = [];
  const chunks = sliceIntoChunks(cdpIds, 100);
  for (const chunk of chunks)
    res.push(
      ...(await api.multiCall({
        abi: abi.getVaultInfo,
        target: contracts.McdMonitorV2,
        calls: chunk.map(i => ({ params: i})),
      }))
    );

  return res;
};

const getCdpManagerData = async (cdpIds, api) => {
  return cachedCalls({
    items: cdpIds,
    multiCall: async (calls) =>
      api.multiCall({
        abi: abi.ilks,
        target: contracts.CdpManager,
        calls,
      }),
    key: "getCdpManagerData",
  });
};

const getIlkRegistryData = async (ilks, api) => {
  return cachedCalls({
    items: ilks,
    multiCall: async (calls) =>
      api.multiCall({
        abi: abi.info,
        target: contracts.IlkRegistry,
        calls,
      }),
    key: "getIlkRegistryData",
  });
};

const getDecimalsData = async (tokens, api) => {
  return cachedCalls({
    items: tokens,
    multiCall: async (calls) =>
      api.multiCall({
        abi: "erc20:decimals",
        calls,
      }),
    key: "getDecimalsData",
  });
};

let cache = {};
function setCallCache(_cache) {
  cache = _cache;
}

async function cachedCalls({ items, multiCall, key }) {
  if (!cache[key]) cache[key] = {};
  const res = [];
  const missingIds = [];
  const missingIndices = [];
  items.forEach((id, i) => {
    if (cache[key][id]) res[i] = cache[key][id];
    else {
      missingIds.push(id);
      missingIndices.push(i);
    }
  });

  if (missingIds.length) {
    sdk.log("Missing ids", missingIds.length, "key", key);
    const tempRes = await multiCall(missingIds);
    missingIds.forEach((id, i) => {
      res[missingIndices[i]] = tempRes[i];
      cache[key][id] = tempRes[i];
    });
  }
  return res;
}

module.exports = {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
  getDecimalsData,
  setCallCache,
};
