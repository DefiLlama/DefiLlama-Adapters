const {
  getZilliqaBalance,
  getBalances,
} = require('../helper/zilliqa')

// taken from https://swap.xcadnetwork.com/_next/data/E6YkkwWJMYjzQhGDTm38j/pool-overview.json
const TOKENS = [
  "0x153feaddc48871108e286de3304b9597c817b456",   // XCAD
  "0x818ca2e217e060ad17b7bd0124a483a1f66930a9",   // zUSDT
  "0x201C44B426D85fB2c382563483140825Fd81b9b5",   // zOPUL
  "0x31bFa2054B7199F936733f9054DBCE259a3c335a",   // Lunr
  "0x9945a0da3dc74e364da4ea96946c99336013eeb5",   // Heroes Of Lowhelm
  "0xbf79e16872fad92c16810ddd2a7b9b6858c7b756",   // CARBON Token
  "0x3a683fdc022b26d755c70e9ed7cfcc446658018b",   // PackagePortal Token
  "0x91228A48AEA4E4071B9C6444Eb08B021399CfF7c",   // Unifees Token
  "0xa3eAFd5021F6B9c36fD02Ed58aa1d015F2238791",   // ZILStream
  "0xa845C1034CD077bD8D32be0447239c7E4be6cb21",   // Governance ZIL
  "0xb393C898b3d261C362a4987CaE5a833232AA666E",   // Score
  "0x173Ca6770Aa56EB00511Dac8e6E13B3D7f16a5a5",   // XSGD
  "0xaCb721d989c095c64A24d16DfD23b08D738e2552",   // REDChillies
  "0x75fA7D8BA6BEd4a68774c758A5e43Cfb6633D9d6",   // zWBTC
  "0x2cA315F4329654614d1E8321f9C252921192c5f2",   // zETH
  "0x4268C34dA6Ad41a4cDeAa25cdEF6531Ed0c9a1A2",   // BLOX
  "0x2fc7167c3Baff89E2805Aef72636ccD98eE6Bbb2",   // DeMons
  "0x32339fa037f7ae1DfFF25e13c6451a80289D61F4",   // Brokoli
  "0xC6Bb661eDA683BdC792b3e456A206a92cc3cB92e",   // DUCKDUCK
  "0x9bd504b1445fdb8f4a643453ec1459bb9a2f988a",   // XIDR
  "0x54aE64e2092749fb8d25470ffc1d4D6A19c6f2Ab",   // Okipad
  "0x083196549637fAf95C91EcCD157E60430e69E1A7"   // Sparda Wallet
]

const DEX_CONTRACT_ADDRESS = '0x1fb1a4fd7ba94b1617641d6022ba48cafa77eef0'

async function tvl() {
  const balances = {}
  const allContracts = [DEX_CONTRACT_ADDRESS, 
    //  ...SUB_CONTRACT
  ]
  balances['zilliqa'] = await getZilliqaBalance(DEX_CONTRACT_ADDRESS)
  await getBalances(TOKENS, allContracts, balances)
  return balances
}

module.exports = {
  zilliqa: {
    tvl,
  },
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Summed up all the tokens deposited in their dex contract and those controlled by their dex'
}