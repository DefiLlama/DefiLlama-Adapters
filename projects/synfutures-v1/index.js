// SynFutures-v1 TVL from chain
const sdk = require('@defillama/sdk');
const { getBalances } = require('@defillama/sdk/build/eth');
const ethers = require("ethers")
const { getBlock } = require('../helper/getBlock');
const { request, gql } = require("graphql-request");
const { transformBscAddress, transformPolygonAddress, transformArbitrumAddress } = require('../helper/portedTokens');

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

const QUERY_PAIRS = gql`{
  pairs(first: 1000, where: {state_: {status_not_in: [CREATED]}}) {
    id
    symbol
    ammProxy
    futuresProxy
    quote {
      id
      symbol
      decimals
    }
    state{
      status
    }
  }
}`;

const QUERY_META = gql`{
  _meta{
    block{
      hash
      number
    }
  }
}`;

const info = {
  ethereum: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/ethereum-v1',
  },
  bsc: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/bsc-v1',
  },
  polygon: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/polygon-v1',
  },
  arbitrum: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/arbitrum-one-v1',
  },
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const currentBlock = await getBlock(timestamp, chain, chainBlocks)

    const metaData = await request(info[chain].subgraph,QUERY_META)
    const block = Math.min(metaData._meta.block.number, currentBlock);

    const pairsData = await request(info[chain].subgraph,QUERY_PAIRS,{ block });

    let erc20BalanceCalls = []
    let nativeQuotePairs = []

    for (let pair of pairsData.pairs) {
      if (pair.quote.id === ZERO_ADDR) {
        nativeQuotePairs.push(pair.id)   
      } else {
        erc20BalanceCalls.push({
          target: pair.quote.id,
          params: pair.id,
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
    nativeBalances.output.forEach((e) => { sdk.util.sumSingleBalance(balances, chain+ ':' + ZERO_ADDR, e.balance)})
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