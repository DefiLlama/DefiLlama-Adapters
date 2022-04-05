const { calculateUniTvl } = require("../helper/calculateUniTvl.js")
const { getChainTransform } = require('../helper/portedTokens')
const { sumTokens } = require('../helper/unwrapLPs')

const chainConfig = {
  ethereum: {
    factory: '0x91fAe1bc94A9793708fbc66aDcb59087C46dEe10',
    radio: '0x7a5d3A9Dcd33cb8D527f7b5F96EB4Fef43d55636',
    stakingContracts: ['0x3E747B459981d06F70bE99f6aeDbb4E8f26D0066'],
  },
  polygon: {
    factory: '0xB581D0A3b7Ea5cDc029260e989f768Ae167Ef39B',
    radio: '0x613a489785C95afEB3b404CC41565cCff107B6E0',
    shack: '0x6E65Ae5572DF196FAe40Be2545Ebc2A9A24eAcE9',
    stakingContracts: ['0x1D72b58d2b73942451b1D0DFE2B6ef2c5a52a301', '0x01d97Df7dc98E97da0c14ffB27Adf00fda0245DD'],
  },
  bsc: {
    factory: '0x98957ab49b8bc9f7ddbCfD8BcC83728085ecb238',
    radio: '0x30807D3b851A31d62415B8bb7Af7dCa59390434a',
    stakingContracts: ['0xACc89554Fb28A94e5578d8A1B04E88Aa7788D261'],
  },
  avax: {
    factory: '0xa0fbfda09b8815dd42ddc70e4f9fe794257cd9b6',
    radio: '0x02Bfd11499847003De5f0F5AA081C43854d48815',
    stakingContracts: ['0x1a55aBd871a8A5aA973980Ac5f4e7b9E732532C0'],
  },
  // fantom: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // arbitrum: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // xdai: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // heco: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // harmony: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // okex: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // celo: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // palm: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // moonriver: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
  // fuse: {
  //   factory: '0x43eA90e2b786728520e4f930d2A71a477BF2737C'
  // },
  // telos: {
  //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
  // },
}

const moduleExports = Object.keys(chainConfig).reduce((agg, chain) => {
  const {
    factory, stakingContracts, radio, shack
  } = chainConfig[chain]

  async function tvl(timestamp, ethBlock, chainBlocks) {
    console.log('getting for chain', chain)
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const balances = await calculateUniTvl(transformAddress, block, chain, factory, 0, true)
    console.log(chain, 'tvl', balances)
    return balances
  }

  async function staking(ts, ethBlock, chainBlocks) {
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const balances = {}

    if (!stakingContracts || !stakingContracts.length) return balances

    const tokensAndOwners = []
    const tokens = [radio]
    if (shack) tokens.push(shack)
    stakingContracts.forEach(owner => tokens.forEach(token => tokensAndOwners.push([token, owner])))
    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress)
    console.log(chain, 'staking', balances)
    return balances
  }

  agg[chain] = { tvl, staking }

  return agg
}, {})

module.exports = {
  ...moduleExports
}