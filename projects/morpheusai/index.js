const ADDRESSES = require('../helper/coreAssets.json')
const PROJECT_CONTRACT = '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790';
const PROJECT_CONTRACT_V2 = '0xDf1AC1AC255d91F5f4B1E3B4Aef57c5350F64C7A';

// Arbitrum: MOR held in the Builders contract counts as staking
// because the deposited asset is the protocol's own token (MOR).
// Contracts verified from Morpheus AI public docs and on-chain data.
const MOR_ARBITRUM = '0x092bAaDB7DEf4C3981454dD9c0A0D7FF07bCFc86';
const BUILDERS_ARBITRUM = '0xC0eD68f163d44B6e9985F0041fDf6f67c6BCFF3f';
// MOR token and Builders contract deployed on Arbitrum on 2024-04-06
const ARBITRUM_DEPLOYMENT_TS = 1712361600; // 2024-04-06 00:00:00 UTC

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

async function arbitrumStaking(api) {
  // Guard: skip historical queries before Arbitrum deployment to avoid reverts
  if (api.timestamp < ARBITRUM_DEPLOYMENT_TS) return;
  return api.sumTokens({ owner: BUILDERS_ARBITRUM, tokens: [MOR_ARBITRUM] });
}

const abi = {
  "getAllATokens": "function getAllATokens() view returns ((string symbol, address tokenAddress)[])",
  "getAllReservesTokens": "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Calculates TVL from stETH deposits in Ethereum project contracts. MOR deposits in the Arbitrum Builders contract are tracked separately as staking.',
  start: '2024-02-08',  // Feb-08-2024 07:33:35 AM UTC
  ethereum: { tvl },
  arbitrum: { staking: arbitrumStaking },
  hallmarks: [
    ['2024-04-06', "MOR token launch"],
  ],
};

