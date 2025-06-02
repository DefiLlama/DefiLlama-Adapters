const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')

const usdtEth = ADDRESSES.ethereum.USDT;
const daiEth = ADDRESSES.ethereum.DAI;
const wbtcEth = ADDRESSES.ethereum.WBTC;
const usdcEth = ADDRESSES.ethereum.USDC;
const wethEth = ADDRESSES.ethereum.WETH;
const xcasEth = "0x7659CE147D0e714454073a5dd7003544234b6Aa0";
const trueUSDEth = ADDRESSES.ethereum.TUSD;
const zeroEth = "0xF0939011a9bb95c3B791f0cb546377Ed2693a574";
const dxpEth="0x88aa4a6C5050b9A1b2Aa7e34D0582025cA6AB745";

const usdtBsc = ADDRESSES.bsc.USDT;
const daiBsc = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const usdcBsc = ADDRESSES.bsc.USDC;
const busdBsc = ADDRESSES.bsc.BUSD;
const ethBsc = ADDRESSES.bsc.ETH;
const wbnbBsc = ADDRESSES.bsc.WBNB;


const daiAvax = ADDRESSES.avax.DAI;
const wavax = ADDRESSES.avax.WAVAX;
const wbtcAvax = ADDRESSES.avax.WBTC_e;
const usdcAvax = ADDRESSES.avax.USDC_e;
const usdtAvax = ADDRESSES.avax.USDT_e;



const wHeco = ADDRESSES.heco.WHT;
const wbtcHeco = "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa";
const ethHeco = "0x64FF637fB478863B7468bc97D30a5bF3A428a1fD";
const usdcHeco = ADDRESSES.heco.USDC_HECO;
const daiHeco = ADDRESSES.heco.DAI_HECO;
const husdHeco = "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047";



const miMatic = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
const wmatic = ADDRESSES.polygon.WMATIC_2;
const wethMatic = ADDRESSES.polygon.WETH_1;
const wbtcMatic = ADDRESSES.polygon.WBTC;
const usdcMatic = ADDRESSES.polygon.USDC;
const daiMatic = ADDRESSES.polygon.DAI;
const usdtMatic = ADDRESSES.polygon.USDT;


const usdtMoonriver = ADDRESSES.moonriver.USDT;
const daiMoonriver = "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844";
const usdcMoonriver = ADDRESSES.moonriver.USDC;
const wbtcMoonriver = "0xE6a991Ffa8CfE62B0bf6BF72959A3d4f11B2E0f5";
const wethMoonriver = "0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6";
const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A";


const usdtFantom = "0x1B27A9dE6a775F98aaA5B90B62a4e2A0B84DbDd9";
const daiFantom = ADDRESSES.fantom.DAI;
const usdcFantom = ADDRESSES.fantom.USDC;
const wFantom = ADDRESSES.fantom.WFTM;
const btcFantom = "0x321162Cd933E2Be498Cd2267a90534A804051b11";


const usdtHarmony = "0x224e64ec1bdce3870a6a6c777edd450454068fec";
const daiHarmony = "0xEf977d2f931C1978Db5F6747666fa1eACB0d0339";
const usdcHarmony = "0x985458e523db3d53125813ed68c274899e9dfab4";
const busdHarmony = "0xe176ebe47d621b984a73036b9da5d834411ef734";
const woneOne = ADDRESSES.harmony.WONE;

const usdcMetis = ADDRESSES.metis.m_USDC;
const usdtMetis = ADDRESSES.metis.m_USDT;
const maticMetis = ADDRESSES.metis.MATIC;
const mimMetis = "0x44Dd7C98885cD3086E723B8554a90c9cC4089C4C";
const ftmMetis = ADDRESSES.oasis.USDT
const metis = ADDRESSES.metis.Metis;
const mdaiMetis="0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0";



const usdtCronos = ADDRESSES.cronos.USDT;
const daiCronos = "0xF2001B145b43032AAF5Ee2884e456CCd805F677D";
const usdcCronos = ADDRESSES.cronos.USDC;
const wbtcCronos = ADDRESSES.cronos.WBTC;
const wethCronos = "0xe44fd7fcb2b1581822d0c862b68222998a0c299a";
const busdCronos = ADDRESSES.oasis.USDT;
const wCronos = ADDRESSES.cronos.WCRO_1;





const usdtIoTex = ADDRESSES.iotex.ioUSDT;
const daiIoTex = ADDRESSES.iotex.ioDAI;
const usdcIoTex = ADDRESSES.iotex.ioUSDC;
const busdIoTex = ADDRESSES.iotex.ioBUSD;
const wIotex = ADDRESSES.iotex.WIOTX;


const usdtOptimism = ADDRESSES.optimism.USDT;
const daiOptimism = ADDRESSES.optimism.DAI;
const wbtcOptimism = ADDRESSES.optimism.WBTC;

const wbtcArbitrum = ADDRESSES.arbitrum.WBTC;
const usdtArbitrum = ADDRESSES.arbitrum.USDT;
const daiArbitrum = ADDRESSES.optimism.DAI;



const ethAddr = "0xF687e1481d85F8b9F4D1f4D4C15348CeF8E5a762";
const eth1Addr = "0xc4DC891d5B5171f789829D6050D5eB64c447e0FE";
const bscAddr = "0x3Ea1f65cf49297eA6d265291a2b09D0f2AE649D6";
const avaxAddr = "0x43BEddB3199F2a635C85FfC4f1af228198D268Ab";
const hecoAddr = "0xA21D529B86ef6B71C0caaE4669726755876a0Dc0";
const polyAddr = "0x3Ea1f65cf49297eA6d265291a2b09D0f2AE649D6";
const moonriverAddr = "0x3e3f619940d9a20DbcF3F7c0c7958f4A67Fac688";
const ftmAddr = "0x502B4683D213C68507fc6d19417df0bB7995b23B";
const sdnAddr = "0x074412fae37D4C3de9964980352faD07aacDd674";
const iotexAddr = "0xEfB3E6a5cCe777AE472D1255D712407fd22A9547";
const harmonyAddr = "0xa0026a3047bDf539f6Bf405aF576BE2038faC5A8";
const metisAddr = "0x640b3408EaC140297136677aC0cFF13a8c82C5Ed";
const cronosAddr = "0x3f1B059d94551c9300176ceB55FD23aF0e4E2E29";
const BRIDGE_ADDRESS = "0x9A8cF02F3e56c664Ce75E395D0E4F3dC3DafE138";

const config = {
  ethereum: {
    tokens: [usdtEth, daiEth, wbtcEth, usdcEth, wethEth, xcasEth, trueUSDEth, zeroEth,dxpEth, nullAddress],
    owners: [ethAddr, eth1Addr, BRIDGE_ADDRESS]
  },
  bsc: {
    tokens: [usdtBsc, daiBsc, usdcBsc, busdBsc, ethBsc, wbnbBsc],
    owners: [bscAddr, BRIDGE_ADDRESS]
  },
  avax: {
    tokens: [daiAvax, wavax, wbtcAvax, usdcAvax, usdtAvax],
    owners: [avaxAddr, BRIDGE_ADDRESS]
  },
  heco: {
    tokens: [wHeco, wbtcHeco, ethHeco, usdcHeco, daiHeco, husdHeco],
    owners: [hecoAddr, BRIDGE_ADDRESS]
  },
  polygon: {
    tokens: [miMatic, wmatic, wethMatic, wbtcMatic, usdcMatic, daiMatic, usdtMatic],
    owners: [polyAddr, BRIDGE_ADDRESS]
  },
  fantom: {
    tokens: [usdcFantom, usdtFantom, daiFantom, wFantom, btcFantom],
    owners: [ftmAddr, BRIDGE_ADDRESS]
  },
  harmony: {
    tokens: [usdtHarmony, daiHarmony, usdcHarmony, busdHarmony, woneOne],
    owners: [harmonyAddr, BRIDGE_ADDRESS]
  },
  metis: {
    tokens: [usdcMetis, usdtMetis, metis, maticMetis, ftmMetis, mimMetis,mdaiMetis],
    owners: [metisAddr, BRIDGE_ADDRESS]
  },
  cronos: {
    tokens: [usdtCronos, daiCronos, usdcCronos, wbtcCronos, wethCronos, busdCronos, wCronos],
    owners: [cronosAddr, BRIDGE_ADDRESS]
  },
  iotex: {
    tokens:  [usdtIoTex, daiIoTex, usdcIoTex, busdIoTex, wIotex],
    owners: [iotexAddr, BRIDGE_ADDRESS]
  },
  moonriver: {
    tokens:  [usdtMoonriver, daiMoonriver, usdcMoonriver, wbtcMoonriver, wethMoonriver, wMOVR],
    owners: [moonriverAddr, BRIDGE_ADDRESS]
  },
  optimism: {
    tokens: [usdtOptimism,daiOptimism,wbtcOptimism],
    owners: [BRIDGE_ADDRESS]
  },
  arbitrum: {
    tokens: [wbtcArbitrum,usdtArbitrum,daiArbitrum],
    owners: [BRIDGE_ADDRESS]
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})

