const ADDRESSES = require('../helper/coreAssets.json')
const PROJECT_CONTRACT = '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790';
const PROJECT_CONTRACT_V2 = '0xDf1AC1AC255d91F5f4B1E3B4Aef57c5350F64C7A';

const builderContracts = {
  arbitrum: {
    token: '0x092bAaDB7DEf4C3981454dD9c0A0D7FF07bCFc86',
    owner: '0xC0eD68f163d44B6e9985F0041fDf6f67c6BCFF3f',
  },
  base: {
    token: '0x7431aDa8a591C955a994a21710752EF9b882b8e3',
    owner: '0x42BB446eAE6dca7723a9eBdb81EA88aFe77eF4B9',
  },
}

async function ethereumTvl(api) {
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

const buildersTvl = ({ token, owner }) => async (api) => api.sumTokens({ owner, tokens: [token], permitFailure: true })

const abi = {
  "getAllATokens": "function getAllATokens() view returns ((string symbol, address tokenAddress)[])",
  "getAllReservesTokens": "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts stETH/Aave deposits in Morpheus capital contracts on Ethereum and MOR deposits in the Builders contracts on Arbitrum and Base.',
  start: '2024-02-08',  // Feb-08-2024 07:33:35 AM UTC in Unix timestamp
  ethereum: { tvl: ethereumTvl },
  arbitrum: { tvl: buildersTvl(builderContracts.arbitrum) },
  base: { tvl: buildersTvl(builderContracts.base) },
  hallmarks: [
    ['2024-04-06', "MOR token launch"],  // May-08-2024 12:00:00 AM UTC in Unix timestamp
  ],
};
