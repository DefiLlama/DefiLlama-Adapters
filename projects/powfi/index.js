const { getConfig } = require("../helper/cache");
const alephium = require("../helper/chain/alephium");

const POOL_API = "https://api.powfi.alephium.org/pools";
const ALPH_ID = "0000000000000000000000000000000000000000000000000000000000000000";
const GET_CPMM_RESERVES = 7;

async function getPools() {
  const pools = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const response = await getConfig(
      `powfi/pools-${page}`,
      `${POOL_API}?page=${page}&pageSize=300`,
    );
    pools.push(...response.data.data);
    totalPages = response.data.meta.totalPages;
  }
  return pools;
}

async function addClmmPool(api, pool) {
  const tokenIds = [pool.token0.id, pool.token1.id];
  const address = alephium.addressFromContractId(pool.poolId);
  const [alphBalance, tokenBalances] = await Promise.all([
    tokenIds.includes(ALPH_ID) ? alephium.getAlphBalance(address) : undefined,
    tokenIds.some((id) => id !== ALPH_ID) ? alephium.getTokensBalance(address) : [],
  ]);

  for (const tokenId of tokenIds) {
    if (tokenId === ALPH_ID) api.add(tokenId, alphBalance.balance);
    else {
      const balance = tokenBalances.find((token) => token.tokenId === tokenId);
      if (balance) api.add(tokenId, balance.balance);
    }
  }
}

async function tvl(api) {
  const pools = await getPools();

  const cpmmPools = pools.filter((pool) => pool.type === "standard");
  const reserves = await alephium.contractMultiCall(
    cpmmPools.map((pool) => ({
      group: 0,
      address: alephium.addressFromContractId(pool.poolId),
      methodIndex: GET_CPMM_RESERVES,
    })),
  );

  cpmmPools.forEach((pool, index) => {
    [pool.token0.id, pool.token1.id].forEach((tokenId, tokenIndex) => {
      api.add(tokenId, reserves[index].returns[tokenIndex].value);
    });
  });

  await Promise.all(
    pools
      .filter((pool) => pool.type === "concentrated")
      .map((pool) => addClmmPool(api, pool)),
  );
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the full on-chain reserves of every active PowFi CLMM and CPMM pool. Farming reward balances are excluded.",
  alephium: { tvl },
};
