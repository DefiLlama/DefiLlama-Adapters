const abi = require("./abi.json");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const MASTERCHEF = "0x4de6c2de6b9eBD974738686C9be7a31597146Ac6";
const MASTERCHEF2 = "0x92eEd89eeC81d992FF9135Ee451008E93b83dD86";
const MASTERCHEF3 = "0xC8FF977ee4e5EdA2D650C0e2706995a1DbB4926b";
const MASTERCHEF4 = "0xaDb6C60f0D62d6e7583e4b7B3697aAAd723d4a85";

const masterchefTvl = async (timestamp, ethBlock, { fantom: block }) => {
  const chain = 'fantom'
  const balances = {};
  const promises = [MASTERCHEF, MASTERCHEF2, MASTERCHEF3, MASTERCHEF4].map(currentMasterchef => addFundsInMasterChef(
    balances, currentMasterchef, block, chain, undefined,
    currentMasterchef === MASTERCHEF4 ? abi.masterFarmerPoolInfo : abi.poolInfo
  ))

  await Promise.all(promises)
  return unwrapLPsAuto({ balances, block, chain, });
};

const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'bsc'
const factory = '0x40dFC2f530469452D5A9bB33356B071Be0758c4c' // v2 factory address

module.exports = {
  methodology: 'MasterChef Contents plus tokens in dex pools',
  fantom: {
    tvl: masterchefTvl,
  },
  ...uniTvlExport(chain, factory),
};
