const axios = require('axios')

const rstOBOL = '0x1932e815254c53B3Ecd81CECf252A5AC7f0e8BeA'
const ENDPOINT_BASE = 'https://api.obol.tech/tvs/mainnet';
const stakeForSharesABI = "function stakeForShares(uint256 _shares) view returns (uint256)"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const buildUrl = ({ limit, page, dateString }) => `${ENDPOINT_BASE}?limit=${limit}&page=${page}&details=true&timestamp=${encodeURIComponent(dateString)}`;

async function fetchBalancesForTimestamp(tsSeconds, { limit = 1000, delayMs = 500 } = {}) {
  const dateString = new Date(tsSeconds * 1000).toISOString().slice(0, 10); // "YYYY-MM-DD"

  const firstUrl = buildUrl({ limit, page: 0, dateString });
  const firstPayload = (await axios.get(firstUrl)).data;

  const firstBalances = firstPayload?.balances ?? [];
  const totalPages = Number.isInteger(firstPayload?.total_pages)
    ? firstPayload.total_pages
    : Math.ceil((firstPayload?.total_count ?? firstBalances.length) / limit);

  const allBalances = [...firstBalances];

  for (let page = 1; page < totalPages; page++) {
    await sleep(delayMs);
    const url = buildUrl({ limit, page, dateString });
    const payload = (await axios.get(url)).data;
    const balances = payload?.balances ?? [];
    if (!balances.length) break;
    allBalances.push(...balances);
  }

  return { date: dateString, totalPages, count: allBalances.length, balances: allBalances };
}

const tvl = async (api) => {
  const ts = api.timestamp - 86400
  const { balances } = await fetchBalancesForTimestamp(ts, { limit: 1000, delayMs: 500 });
  balances.forEach(({ balance_eth }) => {
    api.addGasToken(balance_eth * 1e18)
  })
}

const staking = async (api) => {
  const underlying = await api.call({ target: rstOBOL, abi: 'address:STAKE_TOKEN' })
  const supply = await api.call({ target: rstOBOL, abi: 'uint256:totalShares' })
  const stakeForShares = await api.call({ target: rstOBOL, abi: stakeForSharesABI, params:[supply] })
  api.add(underlying, stakeForShares)
}

module.exports = {
  methodology: "Total value of ETH staked on Obol's Distributed Validators",
  ethereum : { tvl, staking }
}