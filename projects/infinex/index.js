const { sumTokens2: sumTokens2Evm } = require('../helper/unwrapLPs')
const { sumTokens2Batched: sumTokens2Solana } = require('./solana');
const { getAccountAddresses, getChainAssets } = require('./api');

async function tvlEvm(api) {
  const tokens = await getChainAssets(api.chain);
  const owners = (await getAccountAddresses()).map(address => address.evm).filter(address => !!address);

  return sumTokens2Evm({ owners, tokens, api, sumChunkSize: 30000 });
}

async function tvlSolana(api) {
  const tokens = await getChainAssets(api.chain);
  const owners = (await getAccountAddresses()).map(address => address.solana).filter(address => !!address);

  return sumTokens2Solana({ owners, tokens });
}

module.exports = {
  methodology: `Sums native + ERC-20 + SPL token balances of all Infinex accounts`,
  base: {
    tvl: tvlEvm
  },
  arbitrum: {
    tvl: tvlEvm
  },
  optimism: {
    tvl: tvlEvm
  },
  polygon: {
    tvl: tvlEvm
  },
  ethereum: {
    tvl: tvlEvm
  },
  solana: {
    tvl: tvlSolana
  },
}
