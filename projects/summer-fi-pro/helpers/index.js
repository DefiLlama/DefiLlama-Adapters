const { getAutomationCdpIdList } = require("./get-automation-cdp-ids");
const {
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
  getDecimalsData,
  setCallCache,
} = require("./calls");

module.exports = {
  setCallCache,
  getAutomationCdpIdList,
  getCdpData,
  getCdpManagerData,
  getIlkRegistryData,
  getDecimalsData,
};
