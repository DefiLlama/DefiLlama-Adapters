const {queryContractWithRetries, queryBankWithRetries} = require('../helper/chain/cosmos');

const AMM_V3_CONTRACT = "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a";
const isNativeToken = (denom) => {
  if (denom.startsWith("orai1")) {
    return false;
  }
  return true;
};

async function oraichainQueryData({contract, data}) {
  return await queryContractWithRetries({contract, chain: 'oraichain', data});
}

function getTokenFormat(tokenAddr) {
  if (tokenAddr.includes("ibc")) return tokenAddr.split("/").join(":")
  else if (tokenAddr.includes("factory")) return "orai:" + tokenAddr.split("/").join(":")
  return "orai:" + tokenAddr
}

async function tvl() {
  try {
    const CHUNK_SIZE = 100
    const pools = []
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await oraichainQueryData({
        contract: AMM_V3_CONTRACT,
        data: {
          pools: {
            limit: CHUNK_SIZE,
            startAfter: pools.length == 0 ? undefined : pools[pools.length - 1].pool_key
          }
        }

      })
      pools.push(...res);
      if (res.length < CHUNK_SIZE) break;
    }
    const poolTokens = pools.map(pool => [pool.pool_key.token_x, pool.pool_key.token_y]).flat()
    const uniqueTokens = new Set(poolTokens);

    const sum = {}
    const balancePromises = Array.from(uniqueTokens).map(async (token) => {
      const key = getTokenFormat(token)
      let tokenBalances = {}
      if (isNativeToken(token)) {
        tokenBalances = await queryBankWithRetries({
          address: AMM_V3_CONTRACT,
          chain: 'oraichain',
          denom: token
        })
        sum[key] = tokenBalances.amount
      } else {
        tokenBalances = await  oraichainQueryData({
          contract: token,
          data: {
            balance: {
              address: AMM_V3_CONTRACT,
            }
          }
        })
        sum[key] = tokenBalances.balance
      }
    })
    await Promise.all(balancePromises)
    return sum
  } catch (error) {
    console.error("Error when get tvl oraidex v3: ", error)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on pool V3",
  orai: {tvl}
}