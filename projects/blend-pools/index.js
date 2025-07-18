
const { stellar } = require("../helper/chain/rpcProxy");
const methodologies = require("../helper/methodologies");
const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";

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
  methodology: `${methodologies.lendingMarket}. TVL is calculated and totaled for all Blend pools in the Blend reward zone.`,
  stellar: {
    tvl, borrowed,
  },
};
