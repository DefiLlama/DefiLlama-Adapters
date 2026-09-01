const { getConfig, getCache, setCache } = require('../helper/cache');
const { sumUnknownTokens, getLPList } = require('../helper/cache/sumUnknownTokens');

const project = 'flokifi-locker';

const chains = {
  ethereum: 1,
  bsc: 56,
  arbitrum: 42161,
  optimism: 10,
  polygon: 137,
  fantom: 250,
  avax: 43114,
  okexchain: 66,
  kcc: 321,
  cronos: 25,
  evmos: 9001,
  op_bnb: 204,
  base: 8453,
  dogechain: 2000,
  blast: 81457,
};

const fetch = async (chainId) => {
  const response = await getConfig(`${project}/${chainId}`, 'https://api.flokifi.com/tokens/vault-pairs-tvl?chainId=' + chainId);
  return response.tokensAndVaults;
}

const isAddress = (str) => /^0x[0-9a-fA-F]{40}$/.test(str)

function splitPairs(pairs) {
  let uniV3NFTHolders = [];
  const tokensAndOwners = [];

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];

    if (!isAddress(pair.vaultAddress)) continue;

    if (pair.isV3) {
      uniV3NFTHolders.push(pair.vaultAddress.toLowerCase());
    } else {
      tokensAndOwners.push([
        pair.tokenAddress.toLowerCase(),
        pair.vaultAddress.toLowerCase(),
      ]);
    }
  }

  uniV3NFTHolders = [...new Set(uniV3NFTHolders)]; // remove duplicates
  return { tokensAndOwners, uniV3NFTHolders };
}

async function tvl(api) {
  const chain = api.chain;
  const pairs = await fetch(chains[chain]);
  let cache = getCache(project, chain) || {};

  const { tokensAndOwners, uniV3NFTHolders } = splitPairs(pairs);

  let lpList = await getLPList({ lps: tokensAndOwners.map((i) => i[0]), ...api, cache });

  const balances = await sumUnknownTokens({
    tokensAndOwners: tokensAndOwners.filter((i) => lpList.includes(i[0])),
    api,
    useDefaultCoreAssets: true,
  });

  await setCache(project, chain, cache);

  return balances;
}

Object.keys(chains).forEach((chain) => {
  module.exports[chain] = { tvl };
});

module.exports.misrepresentedTokens = true;
