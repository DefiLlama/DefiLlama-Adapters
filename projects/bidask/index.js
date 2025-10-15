// projects/bidask/index.js
const { get } = require('../helper/http')
const { call, processTVMSliceReadAddress, rateLimited } = require('../helper/chain/ton')
const { sleep } = require('../helper/utils')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require("../helper/chain/ton");
const { transformDexBalances } = require('../helper/portedTokens')

const FACTORY = 'EQAuBZGak9BdkxuCC9gWUsY4Em3jog94BI4eRzX-3_Bidask' // https://docs.bidask.finance/Architecture#pool-factory
const rateLimitedCall = rateLimited(call);

async function listFactoryPools() {
    const poolsSet = new Set()
    let beforeLt
  
    for (let page = 0; page < 50; page++) {
      const url = `https://toncenter.com/api/v3/transactions?account=${FACTORY}&limit=128&archival=true${beforeLt ? `&before_lt=${beforeLt}` : ''}`
      const res = await get(url)
      const txs = res?.transactions || res?.items || []
      if (!txs.length) break
  
      for (const tx of txs) {
        const outs = tx.out_msgs || tx.outMessages || []
        for (const m of outs) {
          const created = m?.created || m?.created_lt || m?.init || m?.state_init
          const dest = m?.destination || m?.dst || m?.to
          if (created && dest) poolsSet.add(dest)
        }
      }
      beforeLt = txs[txs.length - 1]?.lt || txs[txs.length - 1]?.prev_tx_lt
      if (!beforeLt || txs.length < 128) break
      await sleep(2000)
    }
  
    const pools = [...poolsSet]
  
    const data = []
    for (const pool of pools) {
      try {
        let token0, token1;
        let stack = await rateLimitedCall({ target: pool, abi: 'get_pool_info', rawStack: true })
        const xWallet = processTVMSliceReadAddress(stack[0][1].bytes)
        const yWallet = processTVMSliceReadAddress(stack[1][1].bytes)
        await sleep(1500);

        if (xWallet == 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') { // bidask assigns this address for TON jetton wallet (which doesn't exist)
            token0 = ADDRESSES.ton.TON;
        } else {
            try {
                const stack0 = await rateLimitedCall({ target: xWallet, abi: 'get_wallet_data', rawStack: true})
                token0 = processTVMSliceReadAddress(stack0[2][1].bytes) // https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md#get-methods
                await sleep(1500);
            } catch (e) {
                continue // sometimes it's ok, jetton wallet might be uninit
            }
        }

        if (yWallet == 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') {
            token1 = ADDRESSES.ton.TON;
        } else {
            try {
                let stack1 = await rateLimitedCall({ target: yWallet, abi: 'get_wallet_data', rawStack: true})
                token1 = processTVMSliceReadAddress(stack1[2][1].bytes)
                await sleep(1500);
            } catch (e) {
                continue
            }
        }
  
        const tvl = await rateLimitedCall({ target: pool, abi: 'get_tvl' })  // [amountX, amountY]
        const token0Bal = tvl?.[0]?.toString?.() || String(tvl?.[0] ?? 0)
        const token1Bal = tvl?.[1]?.toString?.() || String(tvl?.[1] ?? 0)
  
        data.push({ pool, token0, token1, token0Bal, token1Bal })
      } catch (e) {
        console.log(e);
      }
      await sleep(1500)
    }

    return data;
}

async function tvl(api) {
    const pools = await listFactoryPools()
    if (!pools.length) return {}

    return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: i.token0,
          token1: i.token1,
          token0Bal: i.token0Bal,
          token1Bal: i.token1Bal,
        }))
      })
    
  }

module.exports = {
  timetravel: false,
  ton: { tvl: tvl },
}
