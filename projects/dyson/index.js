const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = uniTvlExport('linea', '0xecD30C099c222AbffDaf3E2A3d2455FC8e8c739E', { fetchBalances: true, })
//polygon_zkevm
const POLYGON_USDC_TOKEN_CONTRACT = '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035';
const POLYGON_ETH_TOKEN_CONTRACT = '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9';
const POLYGON_ETHUSDC_PAIR_CONTRACT = '0xEce7244a0e861C841651401fC22cEE577fEE90AF';


async function polygon_zkevm_tvl(_, _1, _2, { api }) {
  const usdcBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: POLYGON_USDC_TOKEN_CONTRACT,
    params: [POLYGON_ETHUSDC_PAIR_CONTRACT],
  });

  const ethBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: POLYGON_ETH_TOKEN_CONTRACT,
    params: [POLYGON_ETHUSDC_PAIR_CONTRACT],
  });

  api.add(POLYGON_USDC_TOKEN_CONTRACT, usdcBalance)
  api.add(POLYGON_ETH_TOKEN_CONTRACT, ethBalance)
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
  
