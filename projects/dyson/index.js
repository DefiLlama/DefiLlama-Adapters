const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  linea: '0xecD30C099c222AbffDaf3E2A3d2455FC8e8c739E',
  polygon_zkevm: '0x51a0d4b81400581d8722627dafcd0c1ff9357d1d',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], fetchBalances: true })
  }
})


//polygon_zkevm
const POLYGON_USDC_TOKEN_CONTRACT = '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035';
const POLYGON_ETH_TOKEN_CONTRACT = '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9';
const POLYGON_DYSN_TOKEN_CONTRACT = '0x9CBD81b43ba263ca894178366Cfb89A246D1159C';

const POLYGON_ETHUSDC_PAIR_CONTRACT = '0xEce7244a0e861C841651401fC22cEE577fEE90AF';
const POLYGON_DYSNUSDC_PAIR_CONTRACT='0xC9001AFF3701e19C29E996D48e474Baf4C5eD006';


async function polygon_zkevm_tvl(_, _1, _2, { api }) {
  const usdcBalanceInETHUSDC = await api.call({
    abi: 'erc20:balanceOf',
    target: POLYGON_USDC_TOKEN_CONTRACT,
    params: [POLYGON_ETHUSDC_PAIR_CONTRACT],
  });

  const usdcBalanceInDYSNUSDC = await api.call({
    abi: 'erc20:balanceOf',
    target: POLYGON_USDC_TOKEN_CONTRACT,
    params: [POLYGON_DYSNUSDC_PAIR_CONTRACT],
  });

  const ethBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: POLYGON_ETH_TOKEN_CONTRACT,
    params: [POLYGON_ETHUSDC_PAIR_CONTRACT],
  });
  const dysnBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: POLYGON_DYSN_TOKEN_CONTRACT,
    params: [POLYGON_DYSNUSDC_PAIR_CONTRACT],
  });


  api.add(POLYGON_USDC_TOKEN_CONTRACT, usdcBalanceInETHUSDC)
  api.add(POLYGON_USDC_TOKEN_CONTRACT, usdcBalanceInDYSNUSDC)
  api.add(POLYGON_ETH_TOKEN_CONTRACT, ethBalance)
  api.add(POLYGON_DYSN_TOKEN_CONTRACT, dysnBalance*0.25)
}
//linea
const LINEA_USDC_TOKEN_CONTRACT = '0x176211869cA2b568f2A7D4EE941E073a821EE1ff';
const LINEA_ETH_TOKEN_CONTRACT = '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f';  
const LINEA_ETHUSDC_PAIR_CONTRACT = '0xCeC911f803D984ae2e5A134b2D15218466993869';


async function linea_tvl(_, _1, _2, { api }) {
  const usdcBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: LINEA_USDC_TOKEN_CONTRACT,
    params: [LINEA_ETHUSDC_PAIR_CONTRACT],
  });

  const ethBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: LINEA_ETH_TOKEN_CONTRACT,
    params: [LINEA_ETHUSDC_PAIR_CONTRACT],
  });

  api.add(LINEA_USDC_TOKEN_CONTRACT, usdcBalance)
  api.add(LINEA_ETH_TOKEN_CONTRACT, ethBalance)
}
  
  module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
    start: 1000235,
    linea: {
      tvl:linea_tvl,
    } ,
    polygon_zkevm: {
      tvl: polygon_zkevm_tvl,
      },
  }; 
  