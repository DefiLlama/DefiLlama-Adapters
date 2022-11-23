// SynFutures-v1 TVL from chain
const sdk = require('@defillama/sdk');
const { getBalances } = require('@defillama/sdk/build/eth');
const ethers = require("ethers")
const { getBlock } = require('../helper/getBlock');
const { transformBscAddress, transformPolygonAddress, transformArbitrumAddress } = require('../helper/portedTokens');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

const info = {
  ethereum: {
    startBlock: 12599544,
    factory: {
      basic: '0x6E893DDfA75D67FEbb853e00f81c913c151BF9A9',
    },
  },
  bsc: {
    startBlock: 8142332,
    factory: {
      basic: '0x6E893DDfA75D67FEbb853e00f81c913c151BF9A9',
    },
  },
  polygon: {
    startBlock: 15508643,
    factory: {
      basic: '0x6E893DDfA75D67FEbb853e00f81c913c151BF9A9',
      btcHashRate: '0x24de4E74Dec1200577838081EE4C0665911ae4Ee',
    },
  },
  arbitrum: {
    startBlock: 218805,
    factory: {
      basic: '0x1E7dB497d664E77fC96321A1ad0bf018E55CBfF8',
    },
  },
}

const abi = new ethers.utils.Interface([
  'event NewChainlinkPair(string base, address quote, address oracle, uint256 expiry, address amm, address futures)',
  'event NewUniswapPair(address base, address quote, address oracle, uint256 expiry, address amm, address futures)',
  'event NewBitcoinMiningDifficultyPair(address quote, uint256 expiry, address amm, address futures)',
]);

const topics = [
  'NewChainlinkPair(string,address,address,uint256,address,address)',
  'NewUniswapPair(address,address,address,uint256,address,address)',
  'NewBitcoinMiningDifficultyPair(address,uint256,address,address)'
];

async function getPairsFromLogs(chain, factory, startBlock, endBlock, topic) {
  const pairs = [];

  if (!factory) {
    return pairs;
  }
  console.info(chain, factory, topic.split('(')[0], startBlock, endBlock, 'fetching eth logs...');
  const logs = (
    await sdk.api.util.getLogs({
      chain,
      keys: [],
      fromBlock: startBlock,      
      toBlock: endBlock,
      target: factory,
      topic: topic,
    })
  ).output;
  console.info('logs.length', logs.length);
  logs.forEach((log) => {
    const event = abi.parseLog(log);
    pairs.push({
      id: event.args.futures,
      quote: event.args.quote,
    });
  });
  return pairs;
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks)
    const startBlock = info[chain].startBlock;

    const chainlinkPairs = await getPairsFromLogs(chain, info[chain].factory.basic, startBlock, block, topics[0]);
    const uniswapPairs = await getPairsFromLogs(chain, info[chain].factory.basic, startBlock, block, topics[1]);
    let btcHashRatePairs = [];
    if (chain === 'polygon') {
      btcHashRatePairs = await getPairsFromLogs(chain, info[chain].factory.btcHashRate, startBlock, block, topics[2]);
    }
    console.info(chain, 'chainlinkPairs', chainlinkPairs.length, 'uniswapPairs', uniswapPairs.length, 'btcHashRatePairs', btcHashRatePairs.length);

    const pairs = {};
    for (let pair of chainlinkPairs.concat(uniswapPairs).concat(btcHashRatePairs)) {
      pairs[pair.id] = pair;
    }

    let erc20BalanceCalls = []
    let nativeQuotePairs = []    
    for (let pairId of Object.keys(pairs)) {
      if (pairs[pairId].quote === ZERO_ADDR) {
        nativeQuotePairs.push(pairId)   
      } else {
        erc20BalanceCalls.push({
          target: pairs[pairId].quote,
          params: pairId,
        })
      }
    }

    // erc20 token balances
    const erc20Balances = (
      await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: erc20BalanceCalls,
        block,
        chain,
      })
    )

    // native token balances
    const nativeBalances = await getBalances({
      targets: nativeQuotePairs,
      block: block,
      // decimals: 18,
      chain: chain,
    });

    let transform = id=>id
    if(chain === "bsc"){
      transform = await transformBscAddress()
    } else if(chain === "arbitrum"){
      transform = await transformArbitrumAddress()
    } else if (chain === "polygon") {
      transform = await transformPolygonAddress()
    }
    let balances = {};
    // sum erc20 balances
    sdk.util.sumMultiBalanceOf(balances, erc20Balances, true, transform)
    // sum native token balances
    nativeBalances.output.forEach((e) => {
      sdk.util.sumSingleBalance(balances, ZERO_ADDR, e.balance)
    })
    console.info(chain, balances);
    return balances;
  }
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: chainTvl('polygon'),
  },
  bsc: {
    tvl: chainTvl('bsc'),
  },  
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  arbitrum: {
    tvl: chainTvl('arbitrum'),
  },
}