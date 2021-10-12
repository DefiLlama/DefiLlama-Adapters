const sdk = require("@defillama/sdk");
const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil");
const abi = require("./abi.json");

const syncToken = "0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32" // SYNC
const uniPair = "0xFb2F545A9AD62F38fe600E24f75ecD790d30a7Ba"; // SYNC-ETH PAIR
const cBond = "0xC6c11F32D3ccC3BEaac68793bC3BFBe82838ca9F"; // CBOND contract

async function pool2(timestamp, block) {
  let balances = {};
  let { output: token0 } = await sdk.api.abi.call({
    target: uniPair,
    abi: abi["token0"],
    block,
  });

  let { output: token1 } = await sdk.api.abi.call({
    target: uniPair,
    abi: abi["token1"],
    block,
  });

  let { output: tokenBalances } = await sdk.api.abi.call({
    target: uniPair,
    abi: abi["getReserves"],
    block,
  });

  sdk.util.sumSingleBalance(balances, token0, tokenBalances._reserve0);
  sdk.util.sumSingleBalance(balances, token1, tokenBalances._reserve1);
  return balances;
}

async function staked(timestamp, block) {
  let balances = {};

  let { output: lockedSync } = await sdk.api.abi.call({
    target: cBond,
    abi: abi["totalSYNCLocked"],
    block,
  });

  sumSingleBalance(balances, syncToken, lockedSync);
  return balances;
}

module.exports = {
  methodology:"Pool2 is the SYNC-ETH pair on UNI and staking according to their FAQ are SYNC tokens locked into CBOND contracts",
  pool2: {
    tvl: pool2,
  },
  staking: {
    tvl: staked,
  },
  tvl: async () => ({}),
};
