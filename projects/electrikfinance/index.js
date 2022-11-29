const sdk = require("@defillama/sdk")
const chain = 'klaytn'
const addressBookAbi = require("./abi/addressBook.json");
const { toUSDTBalances } = require("../helper/balances");

const addressBook = "0x380814144fA550B83A2Be6367c71e60660494cAa";
async function klaytn(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  let klaytnTVL = 0;

  const { output: poolLength } = await sdk.api.abi.call({
    chain, block,
    target: addressBook,
    abi: addressBookAbi.find(i => i.name === 'addressLength')
  })

  const calls = []
  for (let i = 0; i < poolLength; i++)
    calls.push({ params: i})

  const { output: tvl } = await sdk.api.abi.multiCall({
    chain, block,
    target: addressBook,
    abi: addressBookAbi.find(i => i.name === 'getTvl'),
    calls
  })

  tvl.forEach(i => klaytnTVL += Number(i.output))

  klaytnTVL = klaytnTVL / 1e18;
  return toUSDTBalances(klaytnTVL);
}
module.exports = {
  klaytn: {
    tvl: klaytn,
  },
};

