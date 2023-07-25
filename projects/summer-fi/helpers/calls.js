const { sliceIntoChunks } = require("@defillama/sdk/build/util/index.js");
const abi = require("../constants/abi.js");
const contracts = require("../constants/contracts.js");
const sdk = require('@defillama/sdk')

const getCdpData = async (cdpIds, api) => {
  sdk.log(cdpIds.length, 'cdpIds')
  const res = []
  const chunks = sliceIntoChunks(cdpIds, 25)
  for (const chunk of chunks) 
    res.push(...await api.multiCall({
      abi: abi.getVaultInfo,
      target: contracts.McdView,
      calls: chunk,
    }))
  ;

  return res
}

const getCdpManagerData = async (cdpIds, api) =>
  api.multiCall({
    abi: abi.ilks,
    target: contracts.CdpManager,
    calls: cdpIds,
  });

const getIlkRegistryData = async (ilks, api) =>
  api.multiCall({
    abi: abi.info,
    target: contracts.IlkRegistry,
    calls: ilks,
  });

module.exports = {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
};
