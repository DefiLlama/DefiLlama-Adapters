const { sleep } = require('../helper/utils')
const { call } = require('../helper/chain/ton');
const plimit = require("p-limit");
const ADDRESSES = require('../helper/coreAssets.json');

const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getPoolJettonsRateLimited = rateLimited(getPoolCurrentJettons);


const POOLS = [
  'EQC-jlX83DYZgSWRW5q_XuHLWWFQPp2xGmc8BCoeWckKpeHs',
  'EQD6gQSWCayHh0FvUnTXlpfizIWiq7UeE4gYvXGYtEhIYJ8q',
  'EQCE_6TevKEpj8OTz3rZt1D5bR6fENQbSN2bbW0jzxbWGGIo',
]

const UNDERLYING_JETTONS = [
  ADDRESSES.ton.TON,
  ADDRESSES.ton.USDT,
  ADDRESSES.ton.NOT,
]


async function getPoolCurrentJettons(api, poolAddr, underlyingJettonAddr, isBorrowed) {
  const result = await call({
    target: poolAddr,
    abi: 'get_expected_state',
    params: [['num', 0]]
  });
  await sleep(1000 * (2 * Math.random() + 3));
  const jettonCurrentAmount = isBorrowed ? result[6] : result[5];
  api.add(underlyingJettonAddr, jettonCurrentAmount);
}

async function tvl(api) {
  await Promise.all(POOLS.map(async (poolAddr, i) => {
    return getPoolJettonsRateLimited(api, poolAddr, UNDERLYING_JETTONS[i]);
  }))
}

async function borrowed(api) {
  await Promise.all(POOLS.map(async (poolAddr, i) => {
    return getPoolJettonsRateLimited(api, poolAddr, UNDERLYING_JETTONS[i], true);
  }))
}

module.exports = {
  methodology: 'TVL is counted only as current available pool liquidity. Borrowed jettons not included in the tvl',
  timetravel: false,
  ton: {
    tvl,
    borrowed,
  }
}