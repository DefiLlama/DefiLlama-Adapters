// Aave V3 (Ethereum mainnet) – aToken addresses
const AAVE_POOLS = {
    USDC: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
    WETH: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', // aEthWETH
  };
  
  // Compound V3 (Ethereum mainnet) – Comet addresses
  const COMPOUND_COMET_USDC = '0xc3d688B66703497DAA19211EEdff47f25384cdc3'; // cUSDCv3
  const COMPOUND_COMET_WETH = '0xA17581A9E3356d9A858b789D68B4d866e593aE94'; // cWETHv3
  
  // Spark (Ethereum mainnet)
  const SPARK_POOLS = {
    USDC: '0x28B3a8fb53B741A8Fd78c0fb9A6B2393d896a43d', // spUSDC
    WETH: '0xfE6eb3b609a7C8352A241f7F3A21CEA4e9209B8f', // spETH
  };
  
  // Morpho vaults (Ethereum mainnet)
  const ETHEREUM_MORPHO_POOLS = {
    'Gauntlet USDC Frontier': '0xc582f04d8a82795aa2ff9c8bb4c1c889fe7b754e',
    'Steakhouse USDC': '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    'kpk USDC Yield V2': '0xD5cCe260E7a755DDf0Fb9cdF06443d593AaeaA13',
    'Clearstar Yield USDC': '0xFa17f7AAdbfAc2C5d3C8125555404c1AE17Df853',
    'Keyrock USDC': '0x6C26793c7F1e2785c09b460676e797b716f0Bc8E',
    'Smokehouse USDC': '0xBEeFFF209270748ddd194831b3fa287a5386f5bC',
    'Steakhouse High Yield Instant': '0xbeeff2C5bF38f90e3482a8b19F12E5a6D2FCa757',
    'Steakhouse Prime Instant': '0xbeef0046fcab1dE47E41fB75BB3dC4Dfc94108E3',
    'Gauntlet WETH Prime': '0x2371e134e3455e0593363cBF89d3b6cf53740618',
    'Re Ecosystem Vault': '0xD1E9242e075Db4bdd3f3c721D7d5fd4180A94A7e',
    'Gauntlet USDC RWA': '0xA8875aaeBc4f830524e35d57F9772FfAcbdD6C45',
    'Alpha USDC Core': '0xb0f05E4De970A1aaf77f8C2F823953a367504BA9',
    '9Summits USDC': '0x1E2aAaDcF528b9cC08F43d4fd7db488cE89F5741',
    'f(x) Protocol Re7 USDC': '0x4F460bb11cf958606C69A963B4A17f9DaEEea8b6',
    'Avantgarde USDC Conservative': '0xeBBaE8CfAbB0092d5B32f00EBeE0c8139d24dDcd',
    'Coinshift USDC': '0x7204B7Dbf9412567835633B6F00C3Edc3a8D6330',
  };
  
  // Fluid (Ethereum mainnet)
  const FLUID_POOLS = {
    USDC: '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33', // fUSDC
    WETH: '0x90551c1795392094FE6D29B758EcCD233cFAa260', // fWETH
  };
  
  // Dolomite (Ethereum mainnet)
  const DOLOMITE_POOLS = {
    USDC: '0xf8b2c637A68cF6A17b1DF9F8992EeBeFf63d2dFf',
  };
  
  // Euler (Ethereum mainnet)
  const EULER_POOLS = {
    'Euler Earn USDC': '0x3B4802FDb0E5d74aA37d58FD77d63e93d4f9A4AF',
    'Euler Prime WETH': '0xD8b27CF359b7D15710a5BE299AF6e7Bf904984C2',
  };
  
  // Wasabi Protocol (Ethereum mainnet)
  const WASABI_POOLS = {
    USDC: '0x7d7bB40f523266B63319Bc3E3f6F351B9E389e8f',
    WETH: '0x630ED8220F9cbc98358a2E2eCb0727D7B9D61397',
  };
  
  // Yearn (Ethereum mainnet) – Morpho Y-WETH Compounder, WETH-2 yVault
  const YEARN_VAULTS = {
    WETH: '0xd9BA99D93ea94a65b5BC838a0106cA3AbC82Ec4F',
    'WETH-2': '0xAc37729B76db6438CE62042AE1270ee574CA7571',
  };
  
  // yoProtocol (Ethereum mainnet)
  const YO_PROTOCOL_VAULTS = {
    WETH: '0x3A43AEC53490CB9Fa922847385D82fe25d0E9De7',
  };
  
  const allPoolTokens = [
    ...Object.values(AAVE_POOLS),
    COMPOUND_COMET_USDC,
    COMPOUND_COMET_WETH,
    ...Object.values(SPARK_POOLS),
    ...Object.values(ETHEREUM_MORPHO_POOLS),
    ...Object.values(FLUID_POOLS),
    ...Object.values(DOLOMITE_POOLS),
    ...Object.values(EULER_POOLS),
    ...Object.values(WASABI_POOLS),
    ...Object.values(YEARN_VAULTS),
    ...Object.values(YO_PROTOCOL_VAULTS),
  ];
  
  module.exports = {
    allPoolTokens,
  };
  
  