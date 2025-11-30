
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');




const GLM = "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429";

const tvlContracts = [
  {
    address: '0x879133Fd79b7F48CE1c368b0fCA9ea168eaF117c', // octant locked GLM contract
    token: GLM
  }
];

async function findBalances(contracts, api) {
  const tokensAndOwners = contracts.map(i => ([i.token, i.address]));
  return sumTokens2({ api, tokensAndOwners });
}

async function tvl(api) {
  return await findBalances(tvlContracts, api);
}


module.exports = {
  ethereum: {
    tvl,
  }
};
