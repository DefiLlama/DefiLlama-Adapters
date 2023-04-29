const utils = require("./helper/utils");
const sdk = require("@defillama/sdk");
const abi = require("./abi");

async function bsc_tvl(timestamp, _, _1, { api }) {
  const balance = await api.call({
    target: "0xdA47DF05a5eeC438d673F01Ef74E9DF4A527ED57",
    abi: "uint256:totalDeposited",
  });
  return balance;
}

async function arbitrum_tvl(timestamp, _, _1, { api }) {
  const balance = await api.call({
    target: "0xD2Ea465D2D45E4bfa093Da27dcf2b8Fa754586c4",
    abi: "uint256:totalDeposited",
  });
  return balance;
}

async function zksync_tvl(timestamp, _, _1, { api }) {
  const balance = await api.call({
    target: "0x97Ec7948e6e59DD7401d4008cc9ED6Dc0b55Af21",
    abi: "uint256:totalDeposited",
  });
  return balance;
}

module.exports = {
  bsc: {
    tvl: () => bsc_tvl,
  },
  arbitrum: {
    tvl: () => arbitrum_tvl,
  },
  zksync: {
    tvl: () => zksync_tvl,
  },
};
