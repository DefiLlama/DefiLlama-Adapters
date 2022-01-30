const sdk = require("@defillama/sdk");

const pools = [
  {
    address: "0x6320E6844EEEa57343d5Ca47D3166822Ec78b116",
    token: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
  },
  {
    address: "0x0697B0a2cBb1F947f51a9845b715E9eAb3f89B4F",
    token: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
  },
  {
    address: "0xc58b8DD0075f7ae7B1CF54a56F899D8b25a7712E",
    token: "0x6b175474e89094c44da98b954eedeac495271d0f", /// DAI
    tokenBalanceRegistry: "0xC6BF8C8A55f77686720E0a88e2Fd1fEEF58ddf4a" /// RariFundManager.balnceOf returns the USD balance of a given holder
  }
];

async function tvl(timestamp, block) {
  let balances = {};
  const lockedBalances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: pools.map((p) => ({
        target: p.tokenBalanceRegistry ? p.tokenBalanceRegistry : p.token,
        params: [p.address],
      })),
      block,
    })
  ).output;

  for (let i = 0; i < pools.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      pools[i].token,
      lockedBalances[i].output
    );
  }
  
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
  tvl
};