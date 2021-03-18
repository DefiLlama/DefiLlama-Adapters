const tokenAddresses = {
  onx: "0xe0ad1806fd3e7edf6ff52fdb822432e847411033",
  sOnx: "0xa99f0ad2a539b2867fcfea47f7e71f240940b47c",
  onxFarm: "0x168f8469ac17dd39cd9a2c2ead647f814a488ce9",
  onxTripleFarm: "0x30D1A19EA928cCf46634cBC2944D2D89Be636f22",
  usdWethPair: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
  onxWethSushiPair: "0x0652687e87a4b8b5370b05bc298ff00d205d9b5f",
  wethAethPair: "0x6147805e1011417b93e5d693424a62a70d09d0e5",
  ankrWethPair: "0x5201883feeb05822ce25c9af8ab41fc78ca73fa9",
  pool: "0x47F3E6C1Ef0cBe69502167095b592e61de108BaA",
  aethToken: "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb",
  onsToken: "0xfC97C0c12438B6E4CF246cD831b02FeF4950DCAD",
  daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  fraxToken: "0x853d955acef822db058eb8505911ed77f175b99e",
  usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  aethPairEth: "0x6147805e1011417B93e5D693424a62A70d09d0E5",
  aethPairOns: "0x5022BbC26B3Bc8c8d2F1F7dB9ee3A2B4631b9b18",
  aethPairOne: "0x5BD4D1f8D46Ad6ae1e6b694eb64f7583C1cB1A74",
  oneVault: "0x3BdF1977d87EDAD8e0617efCEa958F6d43A4C30E",
  wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  bondPairEth: "0xb17b1342579e4bce6b6e9a426092ea57d33843d9",
  sushiPairEth: "0xce84867c3c02b05dc570d0135103d3fb9cc19433",
  farms: [
    {
      title: 'onxEthLp',
      address: '0x62f22A47e5D2F8b71cC44fD85863753618312f67',
      isLpToken: true,
      tokens: [
        '0xe0ad1806fd3e7edf6ff52fdb822432e847411033', // OnX
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // wETH
      ]
    },
    {
      title: 'onxEthSlp',
      address: '0x0652687E87a4b8b5370b05bc298Ff00d205D9B5f',
      isLpToken: true,
      tokens: [
        '0xe0ad1806fd3e7edf6ff52fdb822432e847411033', // OnX
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // wETH
      ]
    },
    {
      title: 'aEth',
      address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
      isLpToken: false,
      tokens: [
        '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', // aETH
        '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb' // aETH
      ]
    },
    {
      title: 'ankr',
      address: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4',
      isLpToken: false,
      tokens: [
        '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', // aETH
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
      ]
    },
    {
      title: 'xSushi',
      address: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
      isLpToken: false,
      tokens: [
        '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272', // xSushi
        '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272' // xSushi
      ]
    },
    {
      title: 'onxEthSlpMulti',
      address: '0x0652687E87a4b8b5370b05bc298Ff00d205D9B5f',
      isLpToken: true,
      tokens: [
        '0xe0ad1806fd3e7edf6ff52fdb822432e847411033', // OnX
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // wETH
      ]
    },
  ],
  onePools: [
    {
      title: 'aeth',
      address: '0x54c532E367031F56c401C6024aC4ABEfF2b03534',
    },
    {
      title: 'weth',
      address: '0xbc2346C3c7F3998A12A1c8E7Be44734EcC832763',
    },
    {
      title: 'onx',
      address: '0x5e60d73437aCCC3294a8Edf59639c1Dc1BaF0d75',
    },
    {
      title: 'dai',
      address: '0xe64796FCc97c33A2193Ba60f013F3fA5D4712d56',
    },
    {
      title: 'frax',
      address: '0xe659fA84e0C687760245046BA63329d44320997c',
    },
    {
      title: 'usdc',
      address: '0x19Eb6536777713aCdAcA8dd9A3AD9843D74E9E3b',
    },
  ],
  onsPools: [
    {
      title: 'aethPairOne',
      address: '0x1B72255a11DF705Bb598E670830E03A19F2D242f',
    },
    {
      title: 'aethPairOns',
      address: '0x7058EE5467edef417746aab0B8cabbbE36eF1798',
    },
    {
      title: 'aethPairEth',
      address: '0x9792eE4c36a622a8CF9566b037c57519A9fe8a56',
    },
  ]
};

module.exports = tokenAddresses;
