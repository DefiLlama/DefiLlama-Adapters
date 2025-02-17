const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const BERO = "0x7838CEc5B11298Ff6a9513Fa385621B765C74174";
const VOTER = "0xd7ea36ECA1cA3E73bC262A6D05DB01E60AE4AD47"

async function borrowed(api) {
  api.add(ADDRESSES.berachain.HONEY, await api.call({ abi: 'uint256:debtTotal', target: BERO }))
}

async function tvl(api) {
  await api.sumTokens({ owner: BERO, token: ADDRESSES.berachain.HONEY })
  const plugins = await api.call({ abi: 'address[]:getPlugins', target: VOTER })
  const tokens = await api.multiCall({  abi: 'address:getToken', calls: plugins})
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: plugins})
  api.add(tokens, supplies)
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  methodology: `Counts the number of locked HONEY in the Beradrome Bonding Curve and deposited liquidity in Beradrome smart contracts`,
  berachain: {
    tvl,
    borrowed,
  },
};

