const { stellar } = require("../helper/chain/rpcProxy");
const methodologies = require("../helper/methodologies");
const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";

async function tvlInfo() {
  return stellar.blendPoolInfo(BACKSTOP_ID)
}

async function tvl() {
  return (await tvlInfo()).tvl
}

async function borrowed() {
  return (await tvlInfo()).borrowed
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is calculated and totaled for all Blend V2 pools in the Blend reward zone.`,
  stellar: {
    tvl, borrowed,
  },
};
