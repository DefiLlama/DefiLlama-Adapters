const sdk = require("@defillama/sdk");
const { getChainTransform } = require('../helper/portedTokens');
const { sumTokens } = require('../helper/unwrapLPs')

const usdtEth = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const daiEth = "0x6b175474e89094c44da98b954eedeac495271d0f";
const wbtcEth = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const usdcEth = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const wethEth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const relayEth = "0x5D843Fa9495d23dE997C394296ac7B4D721E841c";
const xcasEth = "0x7659CE147D0e714454073a5dd7003544234b6Aa0";
const trueUSDEth = "0x0000000000085d4780B73119b644AE5ecd22b376";
const zeroEth = "0xF0939011a9bb95c3B791f0cb546377Ed2693a574";

const usdtBsc = "0x55d398326f99059fF775485246999027B3197955";
const daiBsc = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const usdcBsc = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const busdBsc = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const ethBsc = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const wbnbBsc = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const relayBsc = "0xE338D4250A4d959F88Ff8789EaaE8c32700BD175";


const daiAvax = "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70";
const wavax = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const wbtcAvax = "0x50b7545627a5162F82A992c33b87aDc75187B218";
const usdcAvax = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
const usdtAvax = "0xc7198437980c041c805A1EDcbA50c1Ce5db95118";



const wHeco = "0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F";
const wbtcHeco = "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa";
const ethHeco = "0x64FF637fB478863B7468bc97D30a5bF3A428a1fD";
const usdcHeco = "0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B";
const daiHeco = "0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a";
const husdHeco = "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047";



const miMatic = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const wethMatic = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const wbtcMatic = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
const usdcMatic = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const daiMatic = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const usdtMatic = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";


const usdtMoonriver = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
const daiMoonriver = "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844";
const usdcMoonriver = "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D";
const wbtcMoonriver = "0xE6a991Ffa8CfE62B0bf6BF72959A3d4f11B2E0f5";
const wethMoonriver = "0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6";
const relayMoonriver = "0xAd7F1844696652ddA7959a49063BfFccafafEfe7";
const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A";


const usdtFantom = "0x1B27A9dE6a775F98aaA5B90B62a4e2A0B84DbDd9";
const relayFantom = "0x338003E074DabFec661E1901bdB397aF9Cab6A76";
const daiFantom = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
const usdcFantom = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
const wFantom = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
const btcFantom = "0x321162Cd933E2Be498Cd2267a90534A804051b11";


const usdtHarmony = "0x224e64ec1bdce3870a6a6c777edd450454068fec";
const relayHarmony = "0x0e4d3a20b757cea2a0910129991b9d42cc2be188";
const daiHarmony = "0xEf977d2f931C1978Db5F6747666fa1eACB0d0339";
const usdcHarmony = "0x985458e523db3d53125813ed68c274899e9dfab4";
const busdHarmony = "0xe176ebe47d621b984a73036b9da5d834411ef734";
const woneOne = "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a";



const wsdnShiden = "0x1a6a12953d5439e8965d94d3d8452464fbd53e30";
const usdtShiden = "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b";
const usdcShiden = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";
const busdShiden = "0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a";




const usdcMetis = "0xea32a96608495e54156ae48931a7c20f0dcc1a21";
const usdtMetis = "0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc";
const relayMetis = "0xfe282Af5f9eB59C30A3f78789EEfFA704188bdD4";
const maticMetis = "0x4b9D2923D875edF43980BF5dddDEde3Fb20fC742";
const mimMetis = "0x44Dd7C98885cD3086E723B8554a90c9cC4089C4C";
const ftmMetis = "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8"
const metis = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";
const wbtcMetis = "0xa5B55ab1dAF0F8e1EFc0eB1931a957fd89B918f4";
const avaxMetis = "0xE253E0CeA0CDD43d9628567d097052B33F98D611";
const daiMetis = "0x4651B38e7ec14BB3db731369BFE5B08F2466Bd0A";



const usdtCronos = "0x66e428c3f67a68878562e79A0234c1F83c208770";
const daiCronos = "0xF2001B145b43032AAF5Ee2884e456CCd805F677D";
const usdcCronos = "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59";
const wbtcCronos = "0x062e66477faf219f25d27dced647bf57c3107d52";
const wethCronos = "0xe44fd7fcb2b1581822d0c862b68222998a0c299a";
const relayCronos = "0x9C29650a1B273A031A35F3121914aae882B144A4";
const busdCronos = "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8";
const wCronos = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23";





const usdtIoTex = "0x6fbCdc1169B5130C59E72E51Ed68A84841C98cd1";
const daiIoTex = "0x1CbAd85Aa66Ff3C12dc84C5881886EEB29C1bb9b";
const usdcIoTex = "0x3B2bf2b523f54C4E454F08Aa286D03115aFF326c";
const busdIoTex = "0xacee9b11cd4b3f57e58880277ac72c8c41abe4e4";
const wIotex = "0xa00744882684c3e4747faefd68d283ea44099d03";




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


let ethTokenAddress = [usdtEth, daiEth, wbtcEth, usdcEth, wethEth, xcasEth, trueUSDEth, zeroEth];
let bscTokenAddress = [usdtBsc, daiBsc, usdcBsc, busdBsc, ethBsc, wbnbBsc];
let avaxTokenAddress = [daiAvax, wavax, wbtcAvax, usdcAvax, usdtAvax];
let hecoTokenAddress = [wHeco, wbtcHeco, ethHeco, usdcHeco, daiHeco, husdHeco];
let maticTokenAddress = [miMatic, wmatic, wethMatic, wbtcMatic, usdcMatic, daiMatic, usdtMatic];
let moonTokenAddress = [usdtMoonriver, daiMoonriver, usdcMoonriver, wbtcMoonriver, wethMoonriver, wMOVR];
let fantomTokenAddress = [usdcFantom, usdtFantom, daiFantom, wFantom, btcFantom];
let harmonyTokenAddress = [usdtHarmony, daiHarmony, usdcHarmony, busdHarmony, woneOne];
let shidenTokenAddress = [wsdnShiden, usdtShiden, usdcShiden, busdShiden];
let metisTokenAddress = [usdcMetis, usdtMetis, metis, maticMetis, ftmMetis, mimMetis];
let metisTotalSupply = [wbtcMetis, daiMetis, avaxMetis, ftmMetis, maticMetis];
let cronosTokenAddress = [usdtCronos, daiCronos, usdcCronos, wbtcCronos, wethCronos, busdCronos, wCronos];
let iotexTokenAddress = [usdtIoTex, daiIoTex, usdcIoTex, busdIoTex, wIotex]


async function ethTvl(timestamp, ethBlock) {
  let balances = {};
  let tokenBalance;
  const toa = []
  ethTokenAddress.forEach(t => {
    toa.push([t, ethAddr])
    toa.push([t, eth1Addr])
  })

  tokenBalance = (await sdk.api.eth.getBalance({ target: eth1Addr })).output;
  await sdk.util.sumSingleBalance(balances, "ethereum:" + "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", tokenBalance)

  return sumTokens(balances, toa, ethBlock)
};


async function bscTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'bsc'
  const toa = []
  let balances = {};
  bscTokenAddress.forEach(t => {
    toa.push([t, bscAddr])
  })


  return sumTokens(balances, toa, chainBlocks[chain], chain)
};

async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'avax'
  const toa = []
  let balances = {};
  avaxTokenAddress.forEach(t => {
    toa.push([t, avaxAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
};

async function hecoTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'heco'
  const toa = []
  let balances = {};
  hecoTokenAddress.forEach(t => {
    toa.push([t, hecoAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
};

async function polygonTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'polygon'
  const toa = []
  let balances = {};
  maticTokenAddress.forEach(t => {
    toa.push([t, polyAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
};

async function fantomTvl(unixTimestamp, ethBlock, chainBlocks) {
  const chain = 'fantom'
  const toa = []
  let balances = {};
  fantomTokenAddress.forEach(t => {
    toa.push([t, ftmAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function harmonyTvl(unixTimestamp, ethBlock, chainBlocks) {
  const chain = 'harmony'
  const toa = []
  let balances = {};
  harmonyTokenAddress.forEach(t => {
    toa.push([t, harmonyAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function metisTvl(unixTimestamp, ethBlock, chainBlocks) {
  const chain = 'metis'
  const toa = []
  let balances = {};
  metisTokenAddress.forEach(t => {
    toa.push([t, metisAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function cronosTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'cronos'
  const toa = []
  let balances = {};
  cronosTokenAddress.forEach(t => {
    toa.push([t, cronosAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function ioTexTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'iotex'
  const toa = []
  let balances = {};
  iotexTokenAddress.forEach(t => {
    toa.push([t, iotexAddr])
  })

  return sumTokens(balances, toa, chainBlocks[chain], chain)
}

async function moonriverTvl(timestamp, ethBlock, chainBlocks) {
  const chain = 'moonriver'
  const toa = []
  let balances = {};
  moonTokenAddress.forEach(t => {
    toa.push([t, moonriverAddr])
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

}; 
