const sdk = require("@defillama/sdk");

const symblox = "0xD0CB9244844F3E11061fb3Ea136Aab3a6ACAC017";
const pools = {
  "0x2af1fea48018fe9f1266d67d45b388935df1c14d": {
    address: "0xaadbaa6758fc00dec9b43a0364a372605d8f1883",
    id: "velas",
    decimals: 18,
  },
  "0x720b92ef8ee928c5cbe9ca787321802610bcbf6e": {
    address: "0x2b1abeb48f875465bf0d3a262a2080ab1c7a3e39",
    id: "velas",
    decimals: 18,
  },
  "0x974d24a6bce9e0a0a27228e627c9ca1437fe0286": {
    address: "0x380f73bad5e7396b260f737291ae5a8100baabcd",
    id: "weth",
    decimals: 18,
  },
  "0xe7557efbe705e425de6a57e90447ba5ad70e9de5": {
    address: "0x4b773e1ae1baa4894e51cc1d1faf485c91b1012f",
    id: "tether",
    decimals: 6,
  },
};

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  block = chainBlocks.velas;

  const pairBalances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: Object.keys(pools).map((p) => ({
        target: pools[p].address,
        params: p,
      })),
      block,
      chain: "velas",
    })
  ).output;

  const syxBalances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: Object.keys(pools).map((p) => ({
        target: symblox,
        params: p,
      })),
      block,
      chain: "velas",
    })
  ).output;

  for (let i = 0; i < Object.keys(pools).length; i++) {
    const pool = Object.values(pools)[i];
    await Promise.all([
      sdk.util.sumSingleBalance(
        balances,
        pool.id,
        pairBalances[i].output / 10 ** pool.decimals
      ),
      sdk.util.sumSingleBalance(
        balances,
        'symblox',
        syxBalances[i].output / 10 ** 18
      ),
    ]);
  }

  return balances;
}

module.exports = {
  velas: {
    tvl,
  },
};
