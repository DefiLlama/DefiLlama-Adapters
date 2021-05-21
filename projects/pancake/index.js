const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const token0 = require('../helper/abis/token0.json');
const token1 = require('../helper/abis/token1.json');
const getReserves = require('../helper/abis/getReserves.json');

const factory = '0xBCfCcbde45cE874adCB698cC183deBcF17952812'

async function processPairs(balances, pairNums){
  const pairs = (await sdk.api.abi.multiCall({
    abi: abi.allPairs,
    chain: 'bsc',
    calls: pairNums.map(num=>({
        target: factory,
        params: [num]
    }))
  })).output
  const pairAddresses = pairs.map(result => result.output.toLowerCase())
  const chain = 'bsc'
  const block = undefined
  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: token0,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: token1,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
    .multiCall({
      abi: getReserves,
      chain,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    }).then(({ output }) => output),
  ]);
  for(let n = 0; n < pairNums.length; n++){
    sdk.util.sumSingleBalance(balances, `bsc:${token0Addresses[n].output}`, reserves[n].output[0]);
    sdk.util.sumSingleBalance(balances, `bsc:${token1Addresses[n].output}`, reserves[n].output[1]);
  }
}

async function tvl(timestamp, ethBlock, chainBlocks){
  const balances = {}
  const pairLength = Number((await sdk.api.abi.call({
      target: factory,
      abi: abi.allPairsLength,
      chain: 'bsc'
  })).output)
  const allPairNums = Array.from(Array(pairLength).keys())
  const reqs = []
  for(let i=0; i< pairLength; i+=2000){
    pairNums = allPairNums.slice(i, i+2000);
    reqs.push(processPairs(balances, pairNums))
  }
  await Promise.all(reqs)
  return {}
}

module.exports = {
  tvl
}