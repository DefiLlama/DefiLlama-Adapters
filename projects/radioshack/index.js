const { calculateUniTvl } = require("../helper/calculateUniTvl.js");
const { getChainTransform } = require('../helper/portedTokens')

const chainConfig = {
  ethereum: {
    factory: '0x91fAe1bc94A9793708fbc66aDcb59087C46dEe10'
  },
  polygon: {
    factory: '0xB581D0A3b7Ea5cDc029260e989f768Ae167Ef39B'
  },
  bsc: {
    factory: '0x98957ab49b8bc9f7ddbCfD8BcC83728085ecb238'
  },
  avax: {
    factory: '0xa0fbfda09b8815dd42ddc70e4f9fe794257cd9b6'
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

const USV_TOKENS = [
  '0x88536c9b2c4701b8db824e6a16829d5b5eb84440',
  'avax:0xb0a8e082e5f8d2a04e74372c1be47737d85a0e73',
  'bsc:0xaf6162dc717cfc8818efc8d6f46a41cf7042fcba',
]

const moduleExports = Object.keys(chainConfig).reduce((agg, chain) => {
  async function tvl(timestamp, ethBlock, chainBlocks) {
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    let balances = await calculateUniTvl(
      transformAddress,
      block,
      chain,
      chainConfig[chain].factory,
      0,
      true
    );

    USV_TOKENS.forEach(usvToken => {
      if (!balances[usvToken]) return;
      balances['polygon:0xac63686230f64bdeaf086fe6764085453ab3023f'] = balances[usvToken]
      delete balances[usvToken]
    })
    return balances;
  }

  agg[chain] = { tvl }
  return agg
}, {})

module.exports = {
  ...moduleExports
};