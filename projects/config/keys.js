const ADDRESSES = require('../helper/coreAssets.json')
let keys =
  {

    [ADDRESSES.ethereum.LINK]: 'chainlink',
    [ADDRESSES.ethereum.WBTC]: 'bitcoin',
    [ADDRESSES.ethereum.AAVE]: 'aave',
    [ADDRESSES.ethereum.USDC]: 'stable',
    [ADDRESSES.ethereum.TUSD]: 'stable',
    [ADDRESSES.ethereum.YFI]: 'yearn-finance',
    '0x408e41876cccdc0f92210600ef50372656052a38': 'republic-protocol', //ren
    '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03': 'ethlend', //lend
    [ADDRESSES.ethereum.BUSD]: 'stable',
    [ADDRESSES.ethereum.USDT]: 'stable',
    [ADDRESSES.ethereum.DAI]: 'stable',
    [ADDRESSES.ethereum.MKR]: 'maker',
    [ADDRESSES.ethereum.SNX]: 'havven',
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': 'decentraland', //MANA
    [ADDRESSES.ethereum.UNI]: 'uniswap',
    '0xdd974d5c2e2928dea5f71b9825b8b646686bd200': 'kyber-network', //knc
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c': 'enjincoin', //ENJ
    [ADDRESSES.ethereum.BAT]: 'basic-attention-token',
    [ADDRESSES.ethereum.sUSD]: 'stable',
    '0xe41d2489571d322189246dafa5ebde1f4699f498': '0x', //0x
    [ADDRESSES.ethereum.CRV]: 'curve-dao-token',
    '0xc00e94cb662c3520282e6f5717214004a7f26888': 'compound-governance-token',
    '0x04fa0d235c4abf4bcf4787af4cf447de572ef828': 'uma',
    '0xd26114cd6ee289accf82350c8d8487fedb8a0c07': 'omisego',
    [ADDRESSES.ethereum.SAI]: 'sai',
    [ADDRESSES.ethereum.WETH]: 'ethereum',
    '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': 'cdai',
    '0xbc396689893d065f41bc2c6ecbee5e0085233447': 'perpetual-protocol',
    '0x92e187a03b6cd19cb6af293ba17f2745fd2357d5': 'unit-protocol-duck',
    '0x2ba592f78db6436527729929aaf6c908497cb200': 'cream',
    '0x0ae055097c6d159879521c384f1d2123d1f195e6': 'xdai-stake',
    '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44': 'keep3rv1',
    [ADDRESSES.ethereum.FTM]: 'fantom',
    [ADDRESSES.ethereum.SUSHI]: 'sushi',
    '0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713': 'cover-protocol',
    '0x3472a5a71965499acd81997a54bba8d852c6e53d': 'badger-dao',
    '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2': 'meta',
    '0xca1207647ff814039530d7d35df0e1dd2e91fa84': 'dhedge-dao',
    '0x1b40183efb4dd766f11bda7a7c3ad8982e998421': 'vesper-finance',
    '0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0': 'dextf',
    '0x903bef1736cddf2a537176cf3c64579c3867a881': 'ichi-farm',
    '0xaac41ec512808d64625576eddd580e7ea40ef8b2': 'gameswap-org',
    '0x7240ac91f01233baaf8b064248e80feaa5912ba3': 'octofi',
    '0x8798249c2e607446efb7ad49ec89dd1865ff4272': 'xsushi',
    '0xb753428af26e81097e7fd17f40c88aaa3e04902c': 'saffron-finance',
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7': 'the-graph',
    '0xc5bddf9843308380375a611c18b50fb9341f502a': 'vecrv-dao-yvault',
    '0x1337def16f9b486faed0293eb623dc8395dfe46a': 'armor',
    '0xd291e7a03283640fdc51b121ac401383a46cc623': 'rari-governance-token',
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d': 'bitcoin', //renbtc
    '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4': 'strudel-finance', // vBTC
  }


module.exports = {
  keys
}
