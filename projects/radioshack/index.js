const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniTVL } = require('../helper/unknownTokens')

const chainConfig = {
  ethereum: {
    factory: '0x91fAe1bc94A9793708fbc66aDcb59087C46dEe10',
    radio: '0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636',
    shack: '0x5f018e73C185aB23647c82bD039e762813877f0e',
    stakingContracts: ['0x3E747B459981d06F70bE99f6aeDbb4E8f26D0066', '0x37c5888e3f8ce7c98022a1640d931563598edc28'],
    blacklist: [
      '0x00C2999c8B2AdF4ABC835cc63209533973718eB1', // STATE - incorrectly priced by gecko
      '0x57b59f981730c6257df57cf6f0d98283749a9eeb', // BUILD - inflating tvl
    ]
  },
  polygon: {
    factory: '0xB581D0A3b7Ea5cDc029260e989f768Ae167Ef39B',
    radio: ADDRESSES.polygon.RADIO,
    shack: '0x6E65Ae5572DF196FAe40Be2545Ebc2A9A24eAcE9',
    stakingContracts: ['0x1D72b58d2b73942451b1D0DFE2B6ef2c5a52a301', '0x01d97Df7dc98E97da0c14ffB27Adf00fda0245DD', '0x9E8C85c40001a7264a1a1B11999F8f7b0503D60a'],
    blacklist: [
      '0xe94845ac6782a2e71c407abe4d5201445c26a62b', // BUILD - inflating tvl
    ]
  },
  bsc: {
    factory: '0x98957ab49b8bc9f7ddbCfD8BcC83728085ecb238',
    radio: '0x30807D3b851A31d62415B8bb7Af7dCa59390434a',
    shack: '0xe79a1163a95734ccFBd006cBAaba954f3e846BeB',
    stakingContracts: ['0xACc89554Fb28A94e5578d8A1B04E88Aa7788D261', '0x68b761d63e488c1d7c5f282c9b7d9a9791c17d3a'],
    blacklist: [
      '0x83b27de2fca046fa63a11c7ce7743de33ec58822', // BUILD - inflating tvl
    ]
  },
  avax: {
    factory: '0xa0fbfda09b8815dd42ddc70e4f9fe794257cd9b6',
    radio: '0x02Bfd11499847003De5f0F5AA081C43854d48815',
    shack: '0x9AD274e20a153451775Ff29D546949a254C4a1bc',
    stakingContracts: ['0x1a55aBd871a8A5aA973980Ac5f4e7b9E732532C0', '0x37c5888e3f8CE7C98022a1640D931563598EDc28'],
    blacklist: [
      '0x5f018e73c185ab23647c82bd039e762813877f0e', // BUILD - inflating tvl
    ]
  },
  fantom: {
    factory: '0x5eF0153590D4a762F129dCf3c59186D91365e4e1',
    radio: '0xf899e3909B4492859d44260E1de41A9E663e70F5',
    shack: '0x462Fa81050f0fF732D59df121BFd9b8Bab072018',
    blacklist: [
      '0xa6097a4dbef3eb44c50bad6286a5ed2bc4418aa2', // BUILD - inflating tvl
    ]
  },
  cronos: {
    factory: '0x5eF0153590D4a762F129dCf3c59186D91365e4e1',
    radio: '0xf899e3909B4492859d44260E1de41A9E663e70F5',
    shack: '0x671D2E0E1a9c8E117A071bFC5763aF3fBe9bDF0b',
    stakingContracts: ['0x68797130D8E63745761C524C33121fdD7290cB72'],
    blacklist: [
      '0x6467df17771ab26d1825bf0891b3c421d92ebc1d', // BUILD - inflating tvl
    ]
  },
  optimism: {
    factory: '0x5eF0153590D4a762F129dCf3c59186D91365e4e1',
    radio: '0xf899e3909B4492859d44260E1de41A9E663e70F5',
    shack: '0x66e8617d1Df7ab523a316a6c01D16Aa5beD93681',
    stakingContracts: ['0x68797130D8E63745761C524C33121fdD7290cB72'],
    blacklist: [
      '0xe4de4b87345815c71aa843ea4841bcdc682637bb', // BUILD - inflating tvl
    ]
  },
  dogechain: {
    factory: '0x6865bc167016EC79C89b03fce536f0c4BAE0EEda',
    radio: '0x4e2a57A8ffE65F794e9A32637Bc67b502fFc84C6',
    shack: '0x57B963fBB8e4Bfb6d9047ac6d5ed183FBe6E7397',
    stakingContracts: ['0x55a5334d1a402383C5a8C622301ea00cc8Cd1681'],
  },
}

module.exports = Object.keys(chainConfig).reduce((agg, chain) => {
  const {
    factory, stakingContracts, radio, shack, blacklist,
  } = chainConfig[chain]

  async function staking(ts, ethBlock, chainBlocks) {
    const block = chainBlocks[chain]
    const tokens = [radio]
    if (shack) tokens.push(shack)
    const balances = {}

    if (!stakingContracts || !stakingContracts.length) return balances
    return sumTokens2({ chain, block, owners: stakingContracts, tokens, })
  }

  agg[chain] = { tvl: getUniTVL({
    chain, factory, 
    useDefaultCoreAssets: true,
    blacklist,
  }), staking }

  return agg
}, {})

module.exports.misrepresentedTokens = true