const abi = require("./abi.json");
const { sumTokens2, } = require('../helper/unwrapLPs')
const { getSymbols } = require('../helper/utils')
const { isWhitelistedToken, } = require('../helper/streamingHelper')

const llamaPayAvax = "0x7d507b4c2d7e54da5731f643506996da8525f4a3";
const llamaPayDefault = "0xde1C04855c2828431ba637675B6929A684f84C7F";
const llamaPayVesting = "0xB93427b83573C8F27a08A909045c3e809610411a";
const llamaPayMeter = "0xc666badd040d5e471d2b77296fef46165ffe5132"
const llamaPayMeterVesting = "0x6B24Fe659D1E91f8800E86600DE577A4cA8814a6";
const llamaPayMetis = "0x43634d1C608f16Fb0f4926c12b54124C93030600";
const llamaPayKava = "0xCA052D073591C0C059675B6F7F95cE75a4Ab8fc8";
const llamaPayKavaVesting = "0xB93427b83573C8F27a08A909045c3e809610411a"

async function calculateTvl(llamapay, vestingContract, api, isVesting) {
  let tokensAndOwners = await getTokensAndOwners(llamapay, api, false)
  const tokens = tokensAndOwners.map(i => i[0])
  const symbolMapping = await getSymbols(api.chain, tokens)
  tokensAndOwners = tokensAndOwners.filter(([token]) => isWhitelistedToken(symbolMapping[token], token, isVesting))
  if (isVesting)
    tokensAndOwners.push(...await getTokensAndOwners(vestingContract, api, true))
  return sumTokens2({ tokensAndOwners, api, resolveLP: false, }) // resolveLP: false maybe breaking them down returns too high TVL for some reason
}

async function getTokensAndOwners(contract, api, isVestingContract) {
  const abis = {
    count: isVestingContract ? abi.escrows_length : abi.getLlamaPayContractCount,
    vault: isVestingContract ? abi.escrows : abi.getLlamaPayContractByIndex,
  }
  const llamaPayContracts = await api.fetchList({ lengthAbi: abis.count, itemAbi: abis.vault, target: contract })
  const llamaPayTokens = await api.multiCall({ calls: llamaPayContracts, abi: abi.token, })
  return llamaPayTokens.map((token, i) => ([token, llamaPayContracts[i]]))
}

const chains = [
  'avax',
  'arbitrum',
  'bsc',
  'fantom',
  'ethereum',
  'optimism',
  'polygon',
  'xdai',
  'meter',
  "metis"
]

chains.forEach(chain => {
  let contract = llamaPayDefault
  let vestingContract = llamaPayVesting

  switch (chain) {
    case 'avax': contract = llamaPayAvax; break;
    case 'meter': contract = llamaPayMeter; vestingContract = llamaPayMeterVesting; break;
    case 'metis': contract = llamaPayMetis; break;
    case 'kava': contract = llamaPayKava; vestingContract = llamaPayKavaVesting; break;
  }

  module.exports[chain] = {
    hallmarks: [
      [Math.floor(new Date('2022-10-03') / 1e3), 'Vesting tokens are not included in tvl'],
    ],
    tvl: async (api) => calculateTvl(contract, vestingContract, api, false),
    vesting: async (api) => calculateTvl(contract, vestingContract, api, true),
  }
})