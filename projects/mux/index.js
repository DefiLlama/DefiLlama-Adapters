const {toUSDTBalances} = require('../helper/balances');
const BigNumber = require("bignumber.js");
const abi = require("./abi.json");

const sdk = require("@defillama/sdk");
const { Contract, providers } = require("ethers");
const utils = require("../helper/utils");

const keys = [
  {
    ETH: "ethereum",
    BTC: "bitcoin",
    DAI: "dai",
    USDC: "usd-coin",
    'USDC.e': "usd-coin",
    AVAX: "avalanche-2",
    USDT: "tether",
    fUSDT: "tether",
    'USDT.e': "tether",
    BUSD: "binance-usd",
    'BUSD.e': "binance-usd",
    BNB: "binancecoin",
    FTM: "fantom",
  },
];

const liquidityPoolContract = {
  arbitrum: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
  bsc: '0x855E99F768FaD76DD0d3EB7c446C0b759C96D520',
  avax: '0x0bA2e492e8427fAd51692EE8958eBf936bEE1d84',
  fantom: '0x2e81F443A11a943196c88afcB5A0D807721A88E6',
}

const readerContract = {
  arbitrum: '0x6e29c4e8095B2885B8d30b17790924F33EcD7b33',
  bsc: '0xeAb5b06a1ea173674601dD54C612542b563beca1',
  avax: '0x5996D4545EE59D96cb1FE8661a028Bef0f4744B0',
  fantom: '0x29F4dC996a0219838AfeCF868362E4df28A70a7b',
}

const chainId = {
  arbitrum: 42161,
  bsc: 56,
  avax: 43114,
  fantom: 250,
}

const rpc = {
  arbitrum: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
  bsc: process.env.BSC_RPC || 'https://bsc-dataseed4.binance.org',
  avax: process.env.AVAX_RPC || 'https://api.avax.network/ext/bc/C/rpc',
  fantom: process.env.FANTOM_RPC || 'https://rpcapi.fantom.network',
}

const invalidAddress = '0x0000000000000000000000000000000000000000'

function hexToStr(hex) {
  const trimedStr = hex.trim();
  const rawStr = trimedStr.substr(0,2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  const len = rawStr.length;
  if(len % 2 !== 0) {
    return "";
  }
  let curCharCode;
  const resultStr = [];
  for(let i = 0; i < len;i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    if (curCharCode !== 0) {
      resultStr.push(String.fromCharCode(curCharCode));
    }
  }
  return resultStr.filter(str => str !== '').join("");
}

async function tvl(chain) {
  const provider = new providers.JsonRpcProvider(rpc[chain], chainId[chain])
  const contract = new Contract(readerContract[chain], abi, provider)
  const storage = await contract.callStatic.getChainStorage()
  const assets = storage[1]
  const dexs = storage[2]

  const prices = (await utils.getPrices(keys)).data;
  const assetsInfoMap = new Map()

  let tvl = new BigNumber(0)
  await Promise.all(assets.map(async (token) => {
    if (token.tokenAddress === invalidAddress) {
      return
    }
    const symbol = hexToStr(token.symbol)
    const price = prices[keys[0][symbol]]?.usd || 0
    assetsInfoMap.set(token.id, {
      price: price,
      decimals: token.decimals,
      symbol: symbol
    })
    const balance = (await sdk.api.erc20.balanceOf({
      target: token.tokenAddress,
      owner: liquidityPoolContract[chain],
      chain: chain
    })).output;
    const tokenAmount = new BigNumber(balance).shiftedBy(-Number(token.decimals))
    tvl = tvl.plus(new BigNumber(tokenAmount).times(price))
  }))

  let dexLiquidity = new BigNumber(0)
  dexs.map(dex => {
    dex.liquidityBalance.map((balance, index) => {
      const assetInfo = assetsInfoMap.get(dex.assetIds[index])
      const tokenAmount =  new BigNumber(balance.toString()).shiftedBy(-Number(assetInfo.decimals))
      dexLiquidity = dexLiquidity.plus(tokenAmount.times(assetInfo?.price || 0))
    })
  })

  return toUSDTBalances(tvl.plus(dexLiquidity))
}

async function arbitrum() {
  return await tvl('arbitrum')
}

async function bsc() {
  return await tvl('bsc')
}

async function fantom() {
  return await tvl('fantom')
}

async function avax() {
  return await tvl('avax')
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `This is the total value of all tokens in the MUXLP Pool. The liquidity pool consists of a token portfolio used for margin trading and third-party DEX mining.`,
  arbitrum: {
    tvl: arbitrum,
  },
  bsc: {
    tvl: bsc
  },
  fantom: {
    tvl: fantom
  },
  avax: {
    tvl: avax
  }
}
