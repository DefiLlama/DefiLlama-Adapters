const { sumTokens2 } = require("../helper/unwrapLPs");

const ADMIN_ADDRESSES = {
  ethereum: "0xf7Cc67326F9A1D057c1e4b110eF6c680B13a1f53",
  arbitrum: "0x4928c8F8c20A1E3C295DddBe05095A9aBBdB3d14",
};

async function tvl(_, _1, _2, { api }) {
  const chainAddress = ADMIN_ADDRESSES[api.chain];
  const collAddresses = await api.call({ abi: "address[]:getValidCollateral", target: chainAddress, });
  const pool = await api.call({ abi: 'address:activePool', target: chainAddress })
  return sumTokens2({ api, tokens: collAddresses, owner: pool })
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Gravita platform",
  start: 1684256400, // Tuesday, May 15, 2023 17:00 GMT
};

Object.keys(ADMIN_ADDRESSES).forEach(chain => {
  module.exports[chain] = { tvl }
})
