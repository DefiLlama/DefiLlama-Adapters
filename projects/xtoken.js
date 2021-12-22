const Web3 = require('web3')
require("dotenv").config();
const retry = require("async-retry");
const axios = require("axios");
const utils = require("./helper/utils");
const BigNumber = require("bignumber.js");
const {
  DEC_18,
  xaaveaAddr,
  xaavebAddr,
  xbntaAddr,
  bntAddr,
  xinchaAddr,
  xinchbAddr,
  xkncaAddr,
  xkncbAddr,
  kncAddr,
  xsnxaAddr,
  xsnxaAdminAddr,
  xsnxaTradeAccountingAddr,
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpcAddr,
  xu3lpdAddr,
  xu3lpeAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
  ethrsi6040Addr,
  snxAddr,
  wbtcAddr,
  wethAddr,
  xu3lpaAddrArbitrum,
  xu3lpbAddrArbitrum,
  xbtc3xAddrArbitrum,
  xeth3xAddrArbitrum,
  wbtcAddrArbitrum,
  wethAddrArbitrum,
  X_ETH_3X,
  X_BTC_3X,
  WBTC,
  WETH,
  QUOTER_ADDRESS,
  usdcAddress,
  wethAddress,
} = require("./config/xtoken/constants");
const xAAVE = require("./config/xtoken/xAAVE.json");
const xBNT = require("./config/xtoken/xBNT.json");
const xINCH = require("./config/xtoken/xINCH.json");
const xKNC = require("./config/xtoken/xKNC.json");
const xSNX = require("./config/xtoken/xSNX.json");
const xSNXTradeAccountingContract = require("./config/xtoken/xSNXTradeAccountingContract.json");
const xU3LP = require("./config/xtoken/xU3LP.json");
const ERC20 = require("./config/xtoken/ERC20.json");
const SNX = require("./config/xtoken/SNX.json");
const xAssetLev = require("./config/xtoken/xAssetLev.json");
const QuoterAbi = require("./config/xtoken/uniswapQuoterAbi.json");
const { ethers, BigNumber: BigNumberEthers, Contract } = require('ethers')
const { formatFixed } = require("@ethersproject/bignumber");
const { formatEther, parseEther, parseUnits } = require('ethers/lib/utils')

async function eth() {
  let web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_RPC));
  const xaaveaCtr = new web3.eth.Contract(xAAVE, xaaveaAddr);
  const xaavebCtr = new web3.eth.Contract(xAAVE, xaavebAddr);
  const xinchaCtr = new web3.eth.Contract(xINCH, xinchaAddr);
  const xinchbCtr = new web3.eth.Contract(xINCH, xinchbAddr);
  const xkncaCtr = new web3.eth.Contract(xKNC, xkncaAddr);
  const xkncbCtr = new web3.eth.Contract(xKNC, xkncbAddr);
  const xsnxaCtr = new web3.eth.Contract(xSNX, xsnxaAddr);
  const xu3lpaCtr = new web3.eth.Contract(xU3LP, xu3lpaAddr);
  const xu3lpbCtr = new web3.eth.Contract(xU3LP, xu3lpbAddr);
  const xu3lpcCtr = new web3.eth.Contract(xU3LP, xu3lpcAddr);
  const xu3lpdCtr = new web3.eth.Contract(xU3LP, xu3lpdAddr);
  const xu3lpeCtr = new web3.eth.Contract(xU3LP, xu3lpeAddr);
  const xu3lpfCtr = new web3.eth.Contract(xU3LP, xu3lpfAddr);
  const xu3lpgCtr = new web3.eth.Contract(xU3LP, xu3lpgAddr);
  const xu3lphCtr = new web3.eth.Contract(xU3LP, xu3lphAddr);
  const xsnxaTradeAccountingCtr = new web3.eth.Contract(
    xSNXTradeAccountingContract,
    xsnxaTradeAccountingAddr
  );
  const ethrsi6040Ctr = new web3.eth.Contract(ERC20, ethrsi6040Addr);
  const snxCtr = new web3.eth.Contract(SNX, snxAddr);
  const xbntaCtr = new web3.eth.Contract(xBNT, xbntaAddr);

  const priceAave = await utils.getPricesfromString("aave");
  const priceBnt = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${bntAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );
  const priceOneInch = await utils.getPricesfromString("1inch");
  const priceKnc = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${kncAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceSnx = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${snxAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceEthrsi6040 = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${ethrsi6040Addr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceSusd = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x57ab1ec28d129707052df4df418d58a2d46d5f51&vs_currencies=usd`
      )
  );

  const priceWeth = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${wethAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceWbtc = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${wbtcAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const xaaveaTvlRaw = await xaaveaCtr.methods.getFundHoldings().call();
  const xaavebTvlRaw = await xaavebCtr.methods.getFundHoldings().call();

  const xaaveaTvlToken = new BigNumber(xaaveaTvlRaw).div(DEC_18).toFixed(2);
  const xaavebTvlToken = new BigNumber(xaavebTvlRaw).div(DEC_18).toFixed(2);

  const xbntaStakedRaw = await xbntaCtr.methods.totalAllocatedNav().call();
  const xbntaBufferRaw = await xbntaCtr.methods.getBufferBalance().call();
  const xbntaPendingRaw = await xbntaCtr.methods
    .getRewardsContributionToNav()
    .call();

  const xbntaStakedToken = new BigNumber(xbntaStakedRaw).div(DEC_18).toFixed(2);
  const xbntaBufferToken = new BigNumber(xbntaBufferRaw).div(DEC_18).toFixed(2);
  const xbntaPendingToken = new BigNumber(xbntaPendingRaw)
    .div(DEC_18)
    .toFixed(2);

  const xinchaTvlRaw = await xinchaCtr.methods.getNav().call();
  const xinchbTvlRaw = await xinchbCtr.methods.getNav().call();

  const xinchaTvlToken = new BigNumber(xinchaTvlRaw).div(DEC_18).toFixed(2);
  const xinchbTvlToken = new BigNumber(xinchbTvlRaw).div(DEC_18).toFixed(2);

  const xkncaTvlRaw = await xkncaCtr.methods.getFundKncBalanceTwei().call();
  const xkncbTvlRaw = await xkncbCtr.methods.getFundKncBalanceTwei().call();

  const xkncaTvlToken = new BigNumber(xkncaTvlRaw).div(DEC_18).toFixed(2);
  const xkncbTvlToken = new BigNumber(xkncbTvlRaw).div(DEC_18).toFixed(2);

  // xU3LP
  const xu3lpaTvlRaw = await xu3lpaCtr.methods.getNav().call();
  const xu3lpbTvlRaw = await xu3lpbCtr.methods.getNav().call();
  const xu3lpcTvlRaw = await xu3lpcCtr.methods.getNav().call();
  const xu3lpdTvlRaw = await xu3lpdCtr.methods.getNav().call();
  const xu3lpeTvlRaw = await xu3lpeCtr.methods.getNav().call();
  const xu3lpfTvlRaw = await xu3lpfCtr.methods.getNav().call();
  const xu3lpgTvlRaw = await xu3lpgCtr.methods.getNav().call();
  const xu3lphTvlRaw = await xu3lphCtr.methods.getNav().call();

  const xu3lpaTvl = Number(new BigNumber(xu3lpaTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpbTvl = Number(new BigNumber(xu3lpbTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpcTvl = Number(new BigNumber(xu3lpcTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpdTvl =
    Number(new BigNumber(xu3lpdTvlRaw).div(DEC_18).toFixed(2)) *
    priceWeth.data["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"].usd;
  const xu3lpeTvl =
    Number(new BigNumber(xu3lpeTvlRaw).div(DEC_18).toFixed(2)) *
    priceWbtc.data["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"].usd;
  const xu3lpfTvl = Number(new BigNumber(xu3lpfTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpgTvl = Number(new BigNumber(xu3lpgTvlRaw).div(DEC_18).toFixed(2));
  const xu3lphTvl = Number(new BigNumber(xu3lphTvlRaw).div(DEC_18).toFixed(2));

  const xaaveaTvl = xaaveaTvlToken * priceAave.data.aave.usd;
  const xaavebTvl = xaavebTvlToken * priceAave.data.aave.usd;

  const xbntaStakedTvl =
    xbntaStakedToken *
    priceBnt.data["0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c"].usd;

  const xbntaBufferTvl =
    xbntaBufferToken *
    priceBnt.data["0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c"].usd;

  const xbntaPendingTvl =
    xbntaPendingToken *
    priceBnt.data["0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c"].usd;

  const xbntaTvl = xbntaStakedTvl + xbntaBufferTvl + xbntaPendingTvl;

  const xinchaTvl = xinchaTvlToken * priceOneInch.data["1inch"].usd;
  const xinchbTvl = xinchbTvlToken * priceOneInch.data["1inch"].usd;

  const xkncaTvl =
    xkncaTvlToken *
    priceKnc.data["0xdd974d5c2e2928dea5f71b9825b8b646686bd200"].usd;
  const xkncbTvl =
    xkncbTvlToken *
    priceKnc.data["0xdd974d5c2e2928dea5f71b9825b8b646686bd200"].usd;

  // xSNXa TVL is SNX + ETH + ETHRSI6040 - sUSD
  const xsnxaSnxRaw = await xsnxaTradeAccountingCtr.methods
    .getSnxBalance()
    .call();
  const xsnxaSnx = new BigNumber(xsnxaSnxRaw).div(DEC_18).toFixed(2);
  const xsnxaSnxTvl =
    xsnxaSnx * priceSnx.data["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"].usd;

  const xsnxaEthRaw = await xsnxaTradeAccountingCtr.methods
    .getEthBalance()
    .call();
  const xsnxaEth = new BigNumber(xsnxaEthRaw).div(DEC_18).toFixed(2);
  const xsnxaEthTvl =
    xsnxaEth * priceWeth.data["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"].usd;

  const xsnxaEthrsi6040Raw = await ethrsi6040Ctr.methods
    .balanceOf(xsnxaAdminAddr)
    .call();
  const xsnxaEthrsi6040 = new BigNumber(xsnxaEthrsi6040Raw)
    .div(DEC_18)
    .toFixed(2);
  const xsnxaEthrsi6040Tvl =
    xsnxaEthrsi6040 *
    priceEthrsi6040.data["0x93e01899c10532d76c0e864537a1d26433dbbddb"].usd;

  const xsnxaSusdRaw = await snxCtr.methods
    .debtBalanceOf(xsnxaAdminAddr, web3.utils.asciiToHex("sUSD"))
    .call();
  const xsnxaSusd = new BigNumber(xsnxaSusdRaw).div(DEC_18).toFixed(2);
  const xsnxaSusdTvl =
    xsnxaSusd *
    priceSusd.data["0x57ab1ec28d129707052df4df418d58a2d46d5f51"].usd;

  const xsnxaTvl =
    xsnxaSnxTvl + xsnxaEthTvl + xsnxaEthrsi6040Tvl - xsnxaSusdTvl;

  const tvl =
    xaaveaTvl +
    xaavebTvl +
    xbntaTvl +
    xinchaTvl +
    xinchbTvl +
    xkncaTvl +
    xkncbTvl +
    xsnxaTvl +
    xu3lpaTvl +
    xu3lpbTvl +
    xu3lpcTvl +
    xu3lpdTvl +
    xu3lpeTvl +
    xu3lpfTvl +
    xu3lpgTvl +
    xu3lphTvl;

  return tvl;
}

async function arbitrum() {
  let web3 = new Web3(new Web3.providers.HttpProvider(process.env.ARBITRUM_RPC));
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ARBITRUM_RPC
  )
  const xu3lpaCtr = new web3.eth.Contract(xU3LP, xu3lpaAddrArbitrum);
  const xu3lpbCtr = new web3.eth.Contract(xU3LP, xu3lpbAddrArbitrum);
  const xu3lpaTvlRaw = await xu3lpaCtr.methods.getNav().call();
  const xu3lpbTvlRaw = await xu3lpbCtr.methods.getNav().call();
  const xu3lpaTvl = Number(new BigNumber(xu3lpaTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpbTvl = Number(new BigNumber(xu3lpbTvlRaw).div(DEC_18).toFixed(2));
  // XAssetLev
  const getXAssetLevAUM = async(xassetlevContract) => {
    const DEC_18 = parseEther('1')
    
    const FEES = BigNumberEthers.from('3000') // 0.3% for xAssetCLR swaps
    const MIN_PRICE = BigNumberEthers.from('4295128740') // asset0 -> asset1 swap
    const MAX_PRICE = BigNumberEthers.from(
      '1461446703485210103287273052203988822378723970341'
    ) // asset1 -> asset0 swap
    

    const getXAssetLevTokenSymbol = (symbol) => {
      switch (symbol) {
        case X_BTC_3X:
          return WBTC
        case X_ETH_3X:
          return WETH
      }
    }

    const formatNumber = (val, digits = 4) => {
      const n = Number(val)
      return Number.isInteger(n) ? n : parseFloat(n.toFixed(digits))
    }

    function formatUnits(value, unitName) {
      if (typeof(unitName) === "string") {
          const index = names.indexOf(unitName);
          if (index !== -1) { unitName = 3 * index; }
      }
      return formatFixed(value, (unitName != null) ? unitName: 18);
    }

    const getEthUsdcPriceUniswapV3 = async() => {
      const quoterContract = new Contract(QUOTER_ADDRESS, QuoterAbi, provider)
      const quantity = await quoterContract.callStatic.quoteExactInputSingle(
        wethAddress,
        usdcAddress,
        FEES,
        DEC_18,
        // In case of Token0 to Token1 trade, the price limit is `MIN_PRICE` and the reverse would be `MAX_PRICE`
        BigNumberEthers.from(usdcAddress).gt(BigNumberEthers.from(wethAddress))
          ? MIN_PRICE
          : MAX_PRICE
      )
    
      return formatUnits(quantity, 6)
    }

    const getTokenEthPriceUniswapV3 = async (
      symbol,
    ) => {
      const addresses = {
        wbtc: wbtcAddrArbitrum,
        weth: wethAddrArbitrum
      }
      const quoterContract = new Contract(QUOTER_ADDRESS, QuoterAbi, provider)
      const tokenContract = new Contract(addresses[symbol], ERC20, provider)
      const tokenDecimals = await tokenContract.decimals()
      const quantity = await quoterContract.callStatic.quoteExactInputSingle(
        tokenContract.address,
        wethAddress,
        FEES,
        parseUnits('1', tokenDecimals),
        // In case of Token0 to Token1 trade, the price limit is `MIN_PRICE` and the reverse would be `MAX_PRICE`
        BigNumberEthers.from(wethAddress).gt(BigNumberEthers.from(tokenContract.address))
          ? MIN_PRICE
          : MAX_PRICE
      )
    
      return formatEther(quantity)
    }

    const symbol = await xassetlevContract.symbol()
    const token = getXAssetLevTokenSymbol(symbol)

    const [
      xassetlevTotalSupply,
      { bufferBalance, marketBalance },
      ethUsdcPrice,
    ] = await Promise.all([
      xassetlevContract.totalSupply(),
      xassetlevContract.getFundBalances(),
      getEthUsdcPriceUniswapV3(),
    ])

    let tokenEthPrice = BigNumberEthers.from('0')
    if (symbol !== X_ETH_3X) {
      tokenEthPrice = parseEther(
        await getTokenEthPriceUniswapV3(token, provider)
      )
    }

    // Price in terms of base asset
    const priceToken = bufferBalance
      .add(marketBalance)
      .mul(DEC_18)
      .div(xassetlevTotalSupply)

    let priceBtc = BigNumberEthers.from('0')
    let priceEth

    if (symbol === X_ETH_3X) {
      priceEth = priceToken
    } else {
      if (symbol === X_BTC_3X) {
        priceBtc = parseUnits(priceToken.toString(), 10)
        priceEth = priceBtc.mul(tokenEthPrice).div(DEC_18)
      } else {
        priceEth = priceToken.mul(tokenEthPrice).div(DEC_18)
      }
    }

    const priceUsd = priceEth.mul(parseEther(ethUsdcPrice)).div(DEC_18)
    
    const aum = priceUsd.mul(xassetlevTotalSupply).div(DEC_18)
    return formatNumber(formatEther(aum), 0)
  }
  
  const xbtc3xCtr = new ethers.Contract(xbtc3xAddrArbitrum, xAssetLev, provider)
  const xeth3xCtr = new ethers.Contract(xeth3xAddrArbitrum, xAssetLev, provider)

  const [xbtc3xTvl, xeth3xTvl] = await Promise.all([
    getXAssetLevAUM(xbtc3xCtr), getXAssetLevAUM(xeth3xCtr)
  ]) 

  const tvl = xu3lpaTvl + xu3lpbTvl + xbtc3xTvl + xeth3xTvl
  return tvl
}

async function fetch() {
  return (await eth())+(await arbitrum())
}


module.exports = {
  ethereum:{
    fetch: eth
  },
  arbitrum:{
    fetch: arbitrum
  },
  fetch,
  methodology: `TVL includes deposits made to the available strategies at xToken Markets.`
};
