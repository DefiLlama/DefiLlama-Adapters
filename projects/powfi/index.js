const { getConfig } = require("../helper/cache");
const alephium = require("../helper/chain/alephium");

const POOL_API = "https://api.powfi.alephium.org/pools";
const ALPH_ID = "0000000000000000000000000000000000000000000000000000000000000000";
const XALPH_ID = "6dc961b59aae53c768fe6f608e6bea30f6747041af3fd800c8c6533766e54f00";
const XALPH_ADDRESS = alephium.addressFromContractId(XALPH_ID);
const GET_XALPH_SUPPLY = 3;
const GET_XALPH_BACKING = 13;
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

function addToken(api, tokenId, amount, xAlphBacking, xAlphSupply) {
  if (tokenId === XALPH_ID) {
    api.add(ALPH_ID, (BigInt(amount) * xAlphBacking) / xAlphSupply);
  } else api.add(tokenId, amount);
}

async function addClmmPool(api, pool, xAlphBacking, xAlphSupply) {
  const tokenIds = [pool.token0.id, pool.token1.id];
  const address = alephium.addressFromContractId(pool.poolId);
  const [alphBalance, tokenBalances] = await Promise.all([
    tokenIds.includes(ALPH_ID) ? alephium.getAlphBalance(address) : undefined,
    tokenIds.some((id) => id !== ALPH_ID) ? alephium.getTokensBalance(address) : [],
  ]);

  for (const tokenId of tokenIds) {
    if (tokenId === ALPH_ID) addToken(api, tokenId, alphBalance.balance, xAlphBacking, xAlphSupply);
    else {
      const balance = tokenBalances.find((token) => token.tokenId === tokenId);
      if (balance) addToken(api, tokenId, balance.balance, xAlphBacking, xAlphSupply);
    }
  }
}

async function tvl(api) {
  const [pools, [xAlphSupplyResult, xAlphBackingResult]] = await Promise.all([
    getPools(),
    alephium.contractMultiCall([
      { group: 0, address: XALPH_ADDRESS, methodIndex: GET_XALPH_SUPPLY },
      { group: 0, address: XALPH_ADDRESS, methodIndex: GET_XALPH_BACKING },
    ]),
  ]);

  const xAlphSupply = BigInt(xAlphSupplyResult.returns[0].value);
  const xAlphBacking = BigInt(xAlphBackingResult.returns[0].value);

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
      addToken(
        api,
        tokenId,
        reserves[index].returns[tokenIndex].value,
        xAlphBacking,
        xAlphSupply,
      );
    });
  });

  await Promise.all(
    pools
      .filter((pool) => pool.type === "concentrated")
      .map((pool) => addClmmPool(api, pool, xAlphBacking, xAlphSupply)),
  );
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the full on-chain reserves of every active PowFi CLMM and CPMM pool. Pool-held xALPH is converted to ALPH at the live contract exchange rate. Farming reward balances are excluded.",
  alephium: { tvl },
};
