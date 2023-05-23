const ADDRESSES = require('./helper/coreAssets.json')

const { sumTokens } = require('./helper/unwrapLPs');


async function tvl(ts, block) {
  var pool = '0xb1cff81b9305166ff1efc49a129ad2afcd7bcf19'

  let tokens = [
    '0x92e187a03b6cd19cb6af293ba17f2745fd2357d5',
    '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44',
    '0x2ba592F78dB6436527729929AAf6c908497cB200',
    ADDRESSES.ethereum.WETH,
    '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    ADDRESSES.ethereum.USDC,
    '0xbC396689893D065F41bc2C6EcbeE5e0085233447',
    ADDRESSES.ethereum.AAVE,
    ADDRESSES.ethereum.FTM,
    ADDRESSES.ethereum.YFI,
    ADDRESSES.ethereum.CRV,
    ADDRESSES.ethereum.SUSHI,
    '0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713',
    '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    '0xb753428af26e81097e7fd17f40c88aaa3e04902c',
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    '0xc5bddf9843308380375a611c18b50fb9341f502a', //apecrv
    '0x1337def16f9b486faed0293eb623dc8395dfe46a', //armor
    ADDRESSES.ethereum.WBTC, //wbtc
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d', //renbtc
    '0xd291e7a03283640fdc51b121ac401383a46cc623',
    ADDRESSES.ethereum.DAI, //dai
  ];
  const toa = tokens.map(t => [t, pool])
  return sumTokens({}, toa, block)
}

module.exports = {
  ethereum: {
    tvl,
  }
}
