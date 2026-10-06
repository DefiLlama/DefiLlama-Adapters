const { getConfig } = require("../helper/cache");
const alephium = require("../helper/chain/alephium");

const POOL_API = "https://api.powfi.alephium.org/pools";
const ALPH_ID = "0000000000000000000000000000000000000000000000000000000000000000";
const XALPH_ID = "6dc961b59aae53c768fe6f608e6bea30f6747041af3fd800c8c6533766e54f00";
const GET_CPMM_RESERVES = 7;
const GET_XALPH_SUPPLY = 3;
const GET_XALPH_BACKING = 13;

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

// xALPH has no price feed, so count it as the ALPH it can be redeemed for,
// at the same totalDepositedAlph / totalXAlphSupply rate the xALPH contract uses.
async function getXAlphToAlph() {
  const xAlphAddress = alephium.addressFromContractId(XALPH_ID);
  const [supply, backing] = await alephium.contractMultiCall(
    [GET_XALPH_SUPPLY, GET_XALPH_BACKING].map((methodIndex) => ({
      group: 0,
      address: xAlphAddress,
      methodIndex,
    })),
  );
  const totalSupply = BigInt(supply.returns[0].value);
  const totalBacking = BigInt(backing.returns[0].value);
  return (amount) => (BigInt(amount) * totalBacking) / totalSupply;
}

async function addClmmPool(add, pool) {
  const tokenIds = [pool.token0.id, pool.token1.id];
  const address = alephium.addressFromContractId(pool.poolId);
  const [alphBalance, tokenBalances] = await Promise.all([
    tokenIds.includes(ALPH_ID) ? alephium.getAlphBalance(address) : undefined,
    tokenIds.some((id) => id !== ALPH_ID) ? alephium.getTokensBalance(address) : [],
  ]);

  for (const tokenId of tokenIds) {
    if (tokenId === ALPH_ID) add(tokenId, alphBalance.balance);
    else {
      const balance = tokenBalances.find((token) => token.tokenId === tokenId);
      if (balance) add(tokenId, balance.balance);
    }
  }
}

async function tvl(api) {
  const [pools, xAlphToAlph] = await Promise.all([getPools(), getXAlphToAlph()]);
  const add = (tokenId, amount) => {
    if (tokenId === XALPH_ID) api.add(ALPH_ID, xAlphToAlph(amount).toString());
    else api.add(tokenId, amount);
  };

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
      add(tokenId, reserves[index].returns[tokenIndex].value);
    });
  });

  await Promise.all(
    pools
      .filter((pool) => pool.type === "concentrated")
      .map((pool) => addClmmPool(add, pool)),
  );
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the full on-chain reserves of every active PowFi CLMM and CPMM pool. xALPH is counted as the ALPH it can be redeemed for. Farming reward balances are excluded.",
  alephium: { tvl },
};
