const { sumTokens2 } = require("../helper/unwrapLPs");

const ADMIN_ADDRESSES = {
  linea: "0xcFcd25b5E200d8829c383d293B456a608777a1D8",
  ethereum: "0x624ceD7034DFF45D439cDe1f443448A49F067715"
};

async function tvl(api) {
  const chainAddress = ADMIN_ADDRESSES[api.chain];
  const collAddresses = await api.call({ abi: "address[]:getValidCollateral", target: chainAddress, });
  const pool = await api.call({ abi: 'address:activePool', target: chainAddress })
  return sumTokens2({ api, tokens: collAddresses, owner: pool })
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Lyve platform",
  start: '2023-11-08', 
};

Object.keys(ADMIN_ADDRESSES).forEach(chain => {
  module.exports[chain] = { tvl }
})
