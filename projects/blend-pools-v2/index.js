const { stellar } = require("../helper/chain/rpcProxy");
const methodologies = require("../helper/methodologies");
const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";

// backstop reward zone only lists pools eligible for BLND emissions, so pools drop out of it while still holding tvl
const POOLS = [
  "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS", // YieldBlox
  "CAJJZSGMMM3PD7N33TAPHGBUGTB43OC73HVIK2L2G6BNGGGYOSSYBXBD", // Fixed
  "CAE7QVOMBLZ53CDRGK3UNRRHG5EZ5NQA7HHTFASEMYBWHG6MDFZTYHXC", // Orbit
  "CBYOBT7ZCCLQCBUYYIABZLSEGDPEUWXCUXQTZYOG3YBDR7U357D5ZIRF", // Forex
  "CDMAVJPFXPADND3YRL4BSM3AKZWCTFMX27GLLXCML3PD62HEQS5FPVAI", // Etherfuse
  "CC4HHXPKR3FIXUQEC53MAK2IVWD6APAEBBXP5XCIW5FISN6PQOAC6UXG", // Solv
];

async function tvlInfo() {
  return stellar.blendPoolInfo(BACKSTOP_ID, POOLS)
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
