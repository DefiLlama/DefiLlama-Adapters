const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getChainTransform } = require('../helper/portedTokens');
const { sumTokens } = require('../helper/unwrapLPs')

const usdtEth = ADDRESSES.ethereum.USDT;
const daiEth = ADDRESSES.ethereum.DAI;
const wbtcEth = ADDRESSES.ethereum.WBTC;
const usdcEth = ADDRESSES.ethereum.USDC;
const wethEth = ADDRESSES.ethereum.WETH;
const relayEth = "0x5D843Fa9495d23dE997C394296ac7B4D721E841c";
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
const relayBsc = "0xE338D4250A4d959F88Ff8789EaaE8c32700BD175";


const daiAvax = ADDRESSES.avax.DAI;
const wavax = ADDRESSES.avax.WAVAX;
const wbtcAvax = "0x50b7545627a5162F82A992c33b87aDc75187B218";
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
const relayMoonriver = "0xAd7F1844696652ddA7959a49063BfFccafafEfe7";
const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A";


const usdtFantom = "0x1B27A9dE6a775F98aaA5B90B62a4e2A0B84DbDd9";
const relayFantom = "0x338003E074DabFec661E1901bdB397aF9Cab6A76";
const daiFantom = ADDRESSES.fantom.DAI;
const usdcFantom = ADDRESSES.fantom.USDC;
const wFantom = ADDRESSES.fantom.WFTM;
const btcFantom = "0x321162Cd933E2Be498Cd2267a90534A804051b11";


const usdtHarmony = "0x224e64ec1bdce3870a6a6c777edd450454068fec";
const relayHarmony = "0x0e4d3a20b757cea2a0910129991b9d42cc2be188";
const daiHarmony = "0xEf977d2f931C1978Db5F6747666fa1eACB0d0339";
const usdcHarmony = "0x985458e523db3d53125813ed68c274899e9dfab4";
const busdHarmony = "0xe176ebe47d621b984a73036b9da5d834411ef734";
const woneOne = ADDRESSES.harmony.WONE;



const wsdnShiden = "0x1a6a12953d5439e8965d94d3d8452464fbd53e30";
const usdtShiden = ADDRESSES.telos.USDC;
const usdcShiden = ADDRESSES.telos.ETH;
const busdShiden = ADDRESSES.shiden.BUSD;




const usdcMetis = ADDRESSES.metis.m_USDC;
const usdtMetis = ADDRESSES.metis.m_USDT;
const relayMetis = ADDRESSES.metis.RELAY;
const maticMetis = ADDRESSES.metis.MATIC;
const mimMetis = "0x44Dd7C98885cD3086E723B8554a90c9cC4089C4C";
const ftmMetis = ADDRESSES.oasis.USDT
const metis = ADDRESSES.metis.Metis;
const wbtcMetis = ADDRESSES.metis.WBTC;
const avaxMetis = ADDRESSES.metis.rAVAX;
const daiMetis = ADDRESSES.metis.DAI;
const mdaiMetis="0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0";



const usdtCronos = ADDRESSES.cronos.USDT;
const daiCronos = "0xF2001B145b43032AAF5Ee2884e456CCd805F677D";
const usdcCronos = ADDRESSES.cronos.USDC;
const wbtcCronos = ADDRESSES.cronos.WBTC;
const wethCronos = "0xe44fd7fcb2b1581822d0c862b68222998a0c299a";
const relayCronos = "0x9C29650a1B273A031A35F3121914aae882B144A4";
const busdCronos = ADDRESSES.oasis.USDT;
const wCronos = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";





const usdtIoTex = ADDRESSES.iotex.ioUSDT;
const daiIoTex = ADDRESSES.iotex.ioDAI;
const usdcIoTex = ADDRESSES.iotex.ioUSDC;
const busdIoTex = ADDRESSES.iotex.ioBUSD;
const wIotex = ADDRESSES.iotex.WIOTX;


const usdtOptimism = ADDRESSES.optimism.USDT;
const daiOptimism = ADDRESSES.optimism.DAI;
const wbtcOptimism = "0x68f180fcCe6836688e9084f035309E29Bf0A2095";

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


let ethTokenAddress = [usdtEth, daiEth, wbtcEth, usdcEth, wethEth, xcasEth, trueUSDEth, zeroEth,dxpEth];
let bscTokenAddress = [usdtBsc, daiBsc, usdcBsc, busdBsc, ethBsc, wbnbBsc];
let avaxTokenAddress = [daiAvax, wavax, wbtcAvax, usdcAvax, usdtAvax];
let hecoTokenAddress = [wHeco, wbtcHeco, ethHeco, usdcHeco, daiHeco, husdHeco];
let maticTokenAddress = [miMatic, wmatic, wethMatic, wbtcMatic, usdcMatic, daiMatic, usdtMatic];
let moonTokenAddress = [usdtMoonriver, daiMoonriver, usdcMoonriver, wbtcMoonriver, wethMoonriver, wMOVR];
let fantomTokenAddress = [usdcFantom, usdtFantom, daiFantom, wFantom, btcFantom];
let harmonyTokenAddress = [usdtHarmony, daiHarmony, usdcHarmony, busdHarmony, woneOne];
let shidenTokenAddress = [wsdnShiden, usdtShiden, usdcShiden, busdShiden];
let metisTokenAddress = [usdcMetis, usdtMetis, metis, maticMetis, ftmMetis, mimMetis,mdaiMetis];
let metisTotalSupply = [wbtcMetis, daiMetis, avaxMetis, ftmMetis, maticMetis];
let cronosTokenAddress = [usdtCronos, daiCronos, usdcCronos, wbtcCronos, wethCronos, busdCronos, wCronos];
let iotexTokenAddress = [usdtIoTex, daiIoTex, usdcIoTex, busdIoTex, wIotex]
let optimismTokenAddress=[usdtOptimism,daiOptimism,wbtcOptimism]
let arbitrumTokenAddress=[wbtcArbitrum,usdtArbitrum,daiArbitrum]


async function ethTvl(timestamp, ethBlock) {
  let balances = {};
  let tokenBalance;
  const toa = []
  ethTokenAddress.forEach(t => {
    toa.push([t, ethAddr])
    toa.push([t, eth1Addr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  tokenBalance = (await sdk.api.eth.getBalance({ target: eth1Addr })).output;
  sdk.util.sumSingleBalance(balances, "ethereum:" + ADDRESSES.ethereum.WETH, tokenBalance)

  return sumTokens(balances, toa, ethBlock)
}


async function bscTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'bsc'
  const toa = []
  let balances = {};
  bscTokenAddress.forEach(t => {
    toa.push([t, bscAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })


  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'avax'
  const toa = []
  let balances = {};
  avaxTokenAddress.forEach(t => {
    toa.push([t, avaxAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function hecoTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'heco'
  const toa = []
  let balances = {};
  hecoTokenAddress.forEach(t => {
    toa.push([t, hecoAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function polygonTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'polygon'
  const toa = []
  let balances = {};
  maticTokenAddress.forEach(t => {
    toa.push([t, polyAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function fantomTvl(unixTimestamp, ethBlock, chainBlocks) {
  const chain = 'fantom'
  const toa = []
  let balances = {};
  fantomTokenAddress.forEach(t => {
    toa.push([t, ftmAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function harmonyTvl(unixTimestamp, ethBlock, chainBlocks) {
  const chain = 'harmony'
  const toa = []
  let balances = {};
  harmonyTokenAddress.forEach(t => {
    toa.push([t, harmonyAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function metisTvl(unixTimestamp, ethBlock, chainBlocks) {
  const chain = 'metis'
  const toa = []
  let balances = {};
  metisTokenAddress.forEach(t => {
    toa.push([t, metisAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function cronosTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'cronos'
  const toa = []
  let balances = {};
  cronosTokenAddress.forEach(t => {
    toa.push([t, cronosAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function ioTexTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'iotex'
  const toa = []
  let balances = {};
  iotexTokenAddress.forEach(t => {
    toa.push([t, iotexAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function moonriverTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'moonriver'
  const toa = []
  let balances = {};
  moonTokenAddress.forEach(t => {
    toa.push([t, moonriverAddr])
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function optimismTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'optimism'
  const toa = []
  let balances = {};
  optimismTokenAddress.forEach(t => {
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function arbitrumTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'arbitrum'
  const toa = []
  let balances = {};
  arbitrumTokenAddress.forEach(t => {
    toa.push([t, BRIDGE_ADDRESS])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}



module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  avax: {
    tvl: avaxTvl,
  },
  heco: {
    tvl: hecoTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  harmony: {
    tvl: harmonyTvl,
  },
  metis: {
    tvl: metisTvl,
  },
  cronos: {
    tvl: cronosTvl,
  },
  iotex: {
    tvl: ioTexTvl,
  },
  moonriver: {
    tvl: moonriverTvl,
  },
  optimism: {
    tvl: optimismTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },

};
