const { sumTokens2 } = require("../helper/unwrapLPs");

const ADMIN_ADDRESSES = {
  arbitrum: "0x4928c8F8c20A1E3C295DddBe05095A9aBBdB3d14",
  era: "0x441F6b484FD60C31b3ca9c61014030b0403F805a",
  ethereum: "0xf7Cc67326F9A1D057c1e4b110eF6c680B13a1f53",
  linea: "0xC8a25eA0Cbd92A6F787AeED8387E04559053a9f8",
  optimism: "0x326398De2dB419Ee39F97600a5eeE97093cf3B27",
  polygon_zkevm: "0x6b42581aC12F442503Dfb3dff2bC75ed83850637",
  mantle: "0x4F39F12064D83F6Dd7A2BDb0D53aF8be560356A6",
};

async function tvl(api) {
  const adminContract = ADMIN_ADDRESSES[api.chain];
  const collAddresses = await api.call({
    abi: "address[]:getValidCollateral",
    target: adminContract,
  });
  const activePool = await api.call({
    abi: "address:activePool",
    target: adminContract,
  });
  const balances = await sumTokens2({ api, tokens: collAddresses, owner: activePool });
  return balances
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Gravita platform",
  start: 1684256400, // Tuesday, May 15, 2023 17:00 GMT
};

Object.keys(ADMIN_ADDRESSES).forEach((chain) => {
  module.exports[chain] = { tvl };
});
