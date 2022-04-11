const sdk = require('@defillama/sdk');

const pinyottasContract = '0x2861e4d8e26b10029e5cd1d236239f810c664b99'

const abi = { 
  "getTokenContractsInPinyotta": {
    "inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],
    "name":"getTokenContractsInPinyotta",
    "outputs":[{"internalType":"address[]","name":"tokenContracts","type":"address[]"}],
    "stateMutability":"view",
    "type":"function"
  },
  "getTokenBalanceInPinyotta": {
    "inputs":[
      {"internalType":"uint256","name":"_id","type":"uint256"},
      {"internalType":"address","name":"_tokenContract","type":"address"}
    ],
    "name":"getTokenBalanceInPinyotta",
    "outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],
    "stateMutability":"view",
    "type":"function"
  }
}

async function tvl(timestamp, block, chainBlocks) {
  // Get number of minted Pinyottas
  const nPinyottas = (
    await sdk.api.abi.call({
      target: pinyottasContract,
      abi: 'erc20:totalSupply',
      block,
      chain: 'ethereum'
    })
  ).output
  console.log('nPinyottas', nPinyottas)

  // Get contract of tokens held within each pinyotta
  const pinyottasIndices = Array.from(Array(parseInt(nPinyottas)).keys());
  const tokenCalls = pinyottasIndices.map(i => ({
    target: pinyottasContract,
    params: i+1
  }))
  const pinyottasTokenContracts = (
    await sdk.api.abi.multiCall({
      calls: tokenCalls,
      abi: abi[ "getTokenContractsInPinyotta"],
      block,
      chain: 'ethereum'
    })
  ).output

  const calls_2 = pinyottasTokenContracts.map((el, i) => el.output.map( token => ({
    target: pinyottasContract,
    params: [i+1, token]
  }))).flat();

  // Get balances for each token (eventually multiple) of each pinyotta
  const pinyottasTokenBalances = (
    await sdk.api.abi.multiCall({
      calls: calls_2,
      abi: abi['getTokenBalanceInPinyotta'],
      block,
      chain: 'ethereum'
    })
  ).output
   
  balances = {}
  pinyottasTokenBalances.forEach(bal => {
    sdk.util.sumSingleBalance(
      balances,
      bal.input.params[1],
      bal.output
    )
  })
  return balances;
}

module.exports = {
  methodology: `Pinyottas are ERC-721 contracts which hold a given amount of ERC20 token. Get pinyottas count, then for each, get contract of token held in the pinyotta and amount (which is zero if pinyotta has been busted so tokens were retrieved)`,
  tvl
}