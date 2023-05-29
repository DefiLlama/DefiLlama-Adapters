const { getLogs } = require('../helper/cache/getLogs')

const sdk = require('@defillama/sdk');
const ABI = require('./abi.json');
const config = {
  ethereum: {
    factory: '0xf1e70677fb1f49471604c012e8B42BA11226336b',
    fromBlock: 17266660,
  },
  arbitrum: {
    factory: '0xB9084c75D361D1d4cfC7663ef31591DeAB1086d6',
    fromBlock: 88503603,
  },
  bsc: {
    factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312',
    fromBlock: 28026886,
  },
  polygon: {
    factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312',
    fromBlock: 42446548,
  }
}

async function tvl(timestamp, blocks, chainBlocks, { api }) {
  const balances = {};
  for(const chain in config) {
    const { factory, fromBlock } = config[chain];
    const logs = await getLogs({
      target: factory,
      topic: 'VaultCreated(address,address)',
      api,
      fromBlock,
    });
    for (const log of logs) {
      const uni_pool = `0x${log.topics[1].substring(26)}`.toLowerCase();
      const vault =`0x${log.topics[2].substring(26)}`.toLowerCase();
      const token0 = (await sdk.api.abi.call({target: uni_pool,abi: ABI.token0,chain: chain}))['output'];
      const token1 = (await sdk.api.abi.call({target: uni_pool,abi: ABI.token1,chain: chain}))['output'];
      const underLyingBalance = (await sdk.api.abi.call({target: vault, abi: ABI.underlyingBalance, chain: chain, block:chainBlocks[chain]})).output;
      await sdk.util.sumSingleBalance(balances, token0, underLyingBalance['amount0Current'],chain);
      await sdk.util.sumSingleBalance(balances, token1, underLyingBalance['amount1Current'],chain);
    }
  }
  console.log(balances);
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'assets deployed on DEX as LP + asset balance of vaults',
  start: 1683965157,
  ethereum: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  bsc: {
    tvl,
  },
  polygon: {
    tvl,
  }
};