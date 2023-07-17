const abi = require("../constants/abi.js");
const contracts = require("../constants/contracts.js");

const getCdpData = async (cdpIds, api) =>
  api.multiCall({
    abi: abi.getVaultInfo,
    target: contracts.McdView,
    calls: cdpIds,
  });

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
