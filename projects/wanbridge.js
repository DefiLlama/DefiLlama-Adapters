const { toUSDTBalances } = require("./helper/balances");
const { get } = require("./helper/http");

let chains = {};

async function getAll() {
  let cache = {};
  cache.minted = await get("https://wanscan.org/api/cc/minted");
  cache.stake = await get("https://wanscan.org/api/cc/stake");
  cache.timestamp = Date.now(); 
  return cache;
}

async function getChains() {
  let ret = await get("https://wanscan.org/api/cc/minted");
  ret.map(v=>chains[v.chain] = v.chain);
}

getChains().then(() => {
  Object.keys(chains).map(chain=>{
    module.exports[chain] = {
      tvl: async () => {
        let ret = await getAll();
        let minted = ret.minted.filter(v=>v.chain == chain);
        let total = 0;
        minted.map(v=>total += Number(v.quantity * v.price));
        if (chain === 'wanchain') {
          total += Number(ret.stake);
        }
        return toUSDTBalances(total);
      }
    };
  })
});

module.exports = {
  timetravel: false,
};


