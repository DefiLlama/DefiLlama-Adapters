const utils = require("./helper/utils");
 var chainId;

 async function fetch() {
   const response = await utils.fetchURL("https://www.crownfinance.io/api/apy.json");

   let tvl = 0;
   for (chainId in response.data) {
     const chain = response.data[chainId];
     tvl += chain.tvl
   }

   return tvl;
 }

 async function main() {
   await(fetch())
 }

 module.exports = {
   methodology:
     'TVL data is pulled from the crown Financial API "https://www.crownfinance.io/api/".',
   cronos: {
     fetch
   },
   fetch,
 };
