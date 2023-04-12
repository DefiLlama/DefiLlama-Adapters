const sdk = require("@defillama/sdk");
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)';
const token0 = "address:token0";
const contracts = require("./contracts.json");
const depositTokens = require('./depositTokens.json')
const { default: BigNumber } = require("bignumber.js");



const getETHPrice = async (block) => {
  const reserves = (
    await sdk.api.abi.call({
      target: contracts["usdtWethPair"],
      abi: getReserves,
      chain: "arbitrum",
    })
  ).output;

  const _token0 = (
    await sdk.api.abi.call({
      target: contracts["usdtWethPair"],
      abi: token0,
      chain: "arbitrum",
    })
  ).output;

  const WETHReserve = new BigNumber(
    _token0.toLowerCase() === contracts["weth"].toLowerCase()
      ? reserves._reserve0
      : reserves._reserve1
  ).div(1e18);
  const USDTReserve = new BigNumber(
    _token0.toLowerCase() === contracts["usdt"].toLowerCase()
      ? reserves._reserve0
      : reserves._reserve1
  ).div(1e6);

  return new BigNumber(USDTReserve).div(new BigNumber(WETHReserve));
};

function calcLobbyPool(day) {
  let start = 5000

  let toReturn = '0'
  for (let i = 0; i < day; i++) {
    const toShow = start
    start -= start / 100
    toReturn = toShow.toFixed(0)
  }

  return toReturn
}

const getWHEATPriceFromLobby = async (block) => {
  const currentDay = new BigNumber(
  (
    await sdk.api.abi.call({
      target: contracts["WHEAT"],
      abi: 'function currentDay() view returns(uint)',
      block: block,
      chain: "arbitrum",
    })
  ).output)

  const pool1 = calcLobbyPool(currentDay.toNumber() - 1)
  const pool2 = calcLobbyPool(currentDay.toNumber() - 2)
  const pool3 = calcLobbyPool(currentDay.toNumber() - 3)


  const entry1 = new BigNumber(
    (
      await sdk.api.abi.call({
        target: contracts["WHEAT"],
        abi: 'function lobbyEntry(uint) view returns(uint)',
        block: block,
        chain: "arbitrum",
        params: [currentDay - 1]
      })
    ).output).div(1e6);

  const entry2 = new BigNumber(
    (
      await sdk.api.abi.call({
        target: contracts["WHEAT"],
        abi: 'function lobbyEntry(uint) view returns(uint)',
        block: block,
        chain: "arbitrum",
        params: [currentDay - 2]
      })
    ).output).div(1e6);

  const entry3 = new BigNumber(
    (
      await sdk.api.abi.call({
        target: contracts["WHEAT"],
        abi: 'function lobbyEntry(uint) view returns(uint)',
        block: block,
        chain: "arbitrum",
        params: [currentDay - 3]
      })
    ).output).div(1e6);

  const first = entry1.div(pool1)
  const second = entry2.div(pool2)
  const third = entry3.div(pool3)

  let avg = first.plus(second).plus(third).div(3)

  return avg
}

const getPrice = async (tokenAddress, block) => {
  return { price: new BigNumber('1'), decimals: 18 };
  /*
  try {
    const ETHPrice = await getETHPrice(block);

    const symbol = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:symbol",
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const isLp = symbol === "ZLP";

    if (tokenAddress.toLowerCase() === contracts["weth"].toLowerCase()) {
      return { price: ETHPrice, decimals: 18 };
    } else if (tokenAddress.toLowerCase() === contracts["WHEAT"].toLowerCase()) {
      const wheatPrice = await getWHEATPriceFromLobby(block)

      return { price: wheatPrice, decimals: 18 };
    }

    const pairAddress = isLp
      ? tokenAddress
      : (
          await sdk.api.abi.call({
            target: contracts["zyberFactoryAddress"],
            abi: 'function getPair(address, address) view returns (address)',
            params: [tokenAddress, contracts["weth"]],
            block: block,
            chain: "arbitrum",
          })
        ).output;

    const reserves = (
      await sdk.api.abi.call({
        target: pairAddress,
        abi: getReserves,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const _token0 = (
      await sdk.api.abi.call({
        target: pairAddress,
        abi: token0,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const decimals = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:decimals",
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const WETHReserve = new BigNumber(
      _token0.toLowerCase() === contracts["weth"].toLowerCase()
        ? reserves._reserve0
        : reserves._reserve1
    ).div(1e18);
    const tokenReserve = new BigNumber(
      _token0.toLowerCase() === tokenAddress.toLowerCase()
        ? reserves._reserve0
        : reserves._reserve1
    ).div(`1e${decimals}`);

    if (isLp) {
      const totalSupply = (
        await sdk.api.abi.call({
          target: tokenAddress,
          abi: "erc20:totalSupply",
          block: block,
          chain: "arbitrum",
        })
      ).output;

      return {
        price: new BigNumber(WETHReserve)
          .times(ETHPrice)
          .times(2)
          .div(new BigNumber(totalSupply).div(`1e${decimals}`)),
        decimals,
      };
    }

    const priceInETH = new BigNumber(tokenReserve).div(
      new BigNumber(WETHReserve)
    );

    return {
      price: ETHPrice.div(priceInETH),
      decimals,
    };
  } catch (e) {
    return {
      price: new BigNumber(0),
      decimals: 0,
    };
  }
  */
};

const tvl = async (timestamp, _, chainBlocks) => {
  const block = chainBlocks['arbitrum']

  const balances = {}

  const ethInIronPool = new BigNumber((await sdk.api.erc20.balanceOf({
    target: contracts.weth,
    owner: contracts.ironPool,
    chain: 'arbitrum'
  })).output)

  const ethPrice = (await getPrice(contracts.weth, block)).price

  let ironPoolTVL = ethInIronPool.times(ethPrice)
  
  balances[`arbitrum:${contracts.weth.toLowerCase()}`] = ironPoolTVL

  for (const depositToken of depositTokens) {
    const tokenPrice = (await getPrice(depositToken.address, block)).price

    const tokenAmountInPool = new BigNumber((await sdk.api.erc20.balanceOf({
      target: depositToken.address,
      owner: contracts.masterchef,
      block: block,
      chain: 'arbitrum'
    })).output)

    if (depositToken.address.toLowerCase() === contracts.weth.toLowerCase()) {
      balances[`arbitrum:${depositToken.address.toLowerCase()}`] = balances[`arbitrum:${depositToken.address.toLowerCase()}`].plus(tokenAmountInPool.times(tokenPrice)).toFixed(0)
    } else {
      balances[`arbitrum:${depositToken.address.toLowerCase()}`] = tokenAmountInPool.times(tokenPrice).toFixed(0)
    }
  }

  const _10SHAREPrice =  (await getPrice(contracts._10SHARE, block)).price

  const boardroomtShareBalanceOf = new BigNumber((await sdk.api.erc20.balanceOf({
    target: contracts._10SHARE,
    owner: contracts.boardroom,
    block: block,
    chain: 'arbitrum'
  })).output)

  balances[`arbitrum:${contracts._10SHARE.toLowerCase()}`] = boardroomtShareBalanceOf.times(_10SHAREPrice).toFixed(0)

  //console.log("balances ", balances)

  return balances
}


module.exports = {
  methodology: `Reads the TVL from assets in the masterchef, boardroom, treasury, and the iron pool.`,
  arbitrum: {
    tvl
  }
};
