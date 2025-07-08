const { queryContract, } = require('../helper/chain/secret')
const { PromisePool } = require('@supercharge/promise-pool');
const { sleep } = require('../helper/utils');

const LEND_OVERSEER_CONTRACT = "secret1pf88n9hm64mn58aw48jxfs2fsvzr07svnrrdlv";

let lendingMarkets = null

async function getLendMarkets() {
  if (!lendingMarkets) lendingMarkets = _get()
  return lendingMarkets

  async function _get() {
    let markets = [], hasMore = true, start = 0, limit = 30

    while (hasMore) {
      const { entries, total } = await queryContract({
        contract: LEND_OVERSEER_CONTRACT, data: {
          markets: {
            pagination: {
              limit: 30,
              start
            }
          }
        }
      });
      start += limit
      hasMore = total > start
      markets = markets.concat(entries.map(i => i.contract.address));
    }

    const data = []

    const { errors } = await PromisePool.withConcurrency(3)
      .for(markets)
      .process(async (addr) => {

        let { total_borrows, total_supply, } = await queryContract({ contract: addr, data: { state: {} } })
        let exchange_rate = await queryContract({ contract: addr, data: { exchange_rate: {} } })
        const { address } = await queryContract({ contract: addr, data: { underlying_asset: {} } })
        // const { token_info: { decimals }} = await queryContract({ contract: address, data: { token_info: {} } })
        const scale = exchange_rate
        data.push({ address, total_borrows: total_borrows * scale, total_supply: total_supply * scale })
        await sleep(1000)
      })

    if (errors && errors.length)
      throw errors[0]

    return data
  }

}

async function tvl(api) {
  const data = await getLendMarkets()
  data.forEach(i => {
    api.add(i.address, i.total_supply - i.total_borrows)
  })

  return api.getBalances()
}

async function borrowed(api) {
  const data = await getLendMarkets()
  data.forEach(i => {
    api.add(i.address, i.total_borrows)
  })


  return api.getBalances()
}

async function staking(api) {
  const SIENNA_SINGLE_SIDED_POOLS = [
    { address: "secret1ja57vrpqusx99rgvxacvej3vhzhh4rhlkdkd7w", version: 1 },
    { address: "secret109g22wm3q3nfys0v6uh7lqg68cn6244n2he4t6", version: 2 },
    { address: "secret1uta9zf3prn7lvc6whp8sqv7ynxmtz3jz9xkyu7", version: 3 }
  ];

  const SIENNA_TOKEN_ADDRESS = "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4";
  await Promise.all(SIENNA_SINGLE_SIDED_POOLS.map(async ({ address, version }) => {
    if (version === 3) {
      const fetchedPool = await queryContract({ contract: address, data: { rewards: { pool_info: { at: new Date().getTime() } } } });
      api.add('sienna', fetchedPool.rewards.pool_info.staked / 1e18, { skipChain: true })
    } else {
      const fetchedPool = await queryContract({ contract: address, data: { pool_info: { at: new Date().getTime() } } });
      api.add('sienna', fetchedPool.pool_info.pool_locked / 1e18, { skipChain: true })
    }
  }));
  return api.getBalances()
}

module.exports = {
  secret: { tvl, borrowed, staking, }
}