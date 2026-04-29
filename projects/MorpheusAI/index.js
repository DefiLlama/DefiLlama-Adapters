const ADDRESSES = require('../helper/coreAssets.json')
const PROJECT_CONTRACT = '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790';
const PROJECT_CONTRACT_V2 = '0xDf1AC1AC255d91F5f4B1E3B4Aef57c5350F64C7A';
const BUILDERS_V4 = {
  arbitrum: { owner: '0xC0eD68f163d44B6e9985F0041fDf6f67c6BCFF3f', fromBlock: 286160086 },
  base: { owner: '0x42BB446eAE6dca7723a9eBdb81EA88aFe77eF4B9', fromBlock: 24381796 },
}

/**
 * Counts MorpheusAI Ethereum TVL from the legacy stETH holder before the V2
 * migration, then from the V2 project contract and related Aave reserve tokens.
 */
async function tvl(api) {
  const v2Deployment = +new Date('2025-09-17') / 1e3
  if (api.timestamp < v2Deployment) {
    return api.sumTokens({ owner: PROJECT_CONTRACT, tokens: [ADDRESSES.ethereum.STETH] })
  }

  const aaveContract = await api.call({ abi: 'address:aavePoolDataProvider', target: PROJECT_CONTRACT_V2 })
  const aTokens = await api.call({ abi: abi.getAllATokens, target: aaveContract })
  const uTokens = await api.call({ abi: abi.getAllReservesTokens, target: aaveContract })
  const tokens = aTokens.map(i => i.tokenAddress).concat(uTokens.map(i => i.tokenAddress))

  tokens.push(ADDRESSES.ethereum.STETH)
  return api.sumTokens({ owners: [PROJECT_CONTRACT_V2, PROJECT_CONTRACT], tokens })

}

/**
 * Counts MOR held by Morpheus BuildersV4 contracts on each chain as staking TVL.
 */
async function buildersStaking(api) {
  const { owner, fromBlock } = BUILDERS_V4[api.chain]
  if (api.block && api.block < fromBlock) return {}
  const token = await api.call({ target: owner, abi: abi.depositToken, permitFailure: true })
  if (!token) return {}
  const balance = await api.call({ target: token, abi: abi.balanceOf, params: [owner] })
  return { [`${api.chain}:${token}`]: balance }
}

const abi = {
  "getAllATokens": "function getAllATokens() view returns ((string symbol, address tokenAddress)[])",
  "getAllReservesTokens": "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
  "depositToken": "address:depositToken",
  "balanceOf": "erc20:balanceOf",
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Ethereum TVL counts stETH and Aave assets held in Morpheus AI project contracts. Staking counts MOR held in Morpheus BuildersV4 contracts on Arbitrum and Base.',
  start: '2024-02-08',  // Feb-08-2024 07:33:35 AM UTC in Unix timestamp
  ethereum: { tvl },
  arbitrum: { staking: buildersStaking },
  base: { staking: buildersStaking },
  hallmarks: [
    ['2024-04-06', "MOR token launch"],  // May-08-2024 12:00:00 AM UTC in Unix timestamp
  ],
};
