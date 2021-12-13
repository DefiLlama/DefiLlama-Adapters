const BigNumber = require("bignumber.js");

const utils = require("../helper/utils");
const { Pools, tokensAddress } = require("./constants.js");
const { getContractInstance } = require("./utils.js");
// node test.js projects/drops/index.js
const masterchefABI = require("./abis/masterchef.json");
const lptokenABI = require("./abis/lpToken.json");
const erc20TokenABI = require("./abis/ERC20.json");

const stakedTVL = async () => {
  let stakingTVL = new BigNumber(0);
  const fromWei = (value, decimals = 18) =>
    decimals < 18
      ? new BigNumber(value).div(10 ** decimals).toString(10)
      : new BigNumber(value).div(10 ** 18).toString(10);

  const masterchefContract = await getContractInstance(
    masterchefABI,
    tokensAddress.masterchef
  );
  const { poolLength, poolInfo } = masterchefContract.methods;

  const length = await poolLength().call();
  const poolInfos = [];
  const res = await utils.getTokenPricesFromString(tokensAddress.Comp);
  const dopPrice = res.data
    ? res.data[tokensAddress.Comp.toLowerCase()].usd
    : 0;

  for (let i = 0; i < length; i += 1) {
    let _info = await poolInfo(i).call();
    poolInfos.push({ ..._info, poolId: i });
  }
  for (let j = 0; j < poolInfos.length; j += 1) {
    let _totalLp;
    let _reserves;
    let _token0;
    let _token1;
    let totalLpSupply;
    let info = poolInfos[j];

    const pool = Pools.find(
      (pool) => pool.lpToken.toLowerCase() === info.lpToken.toLowerCase()
    );
    if (!pool) return resolve(null);
    const poolType = pool.type;
    let methods;

    if (poolType === "LP") {
      const lpTokenContract = await getContractInstance(
        lptokenABI,
        info.lpToken
      );
      methods = lpTokenContract.methods;
      _totalLp = await methods.totalSupply().call();
      _reserves = await methods.getReserves().call();
      _token0 = await methods.token0().call();
      _token1 = await methods.token1().call();
      totalLpSupply = await methods.balanceOf(tokensAddress.masterchef).call();
    } else {
      const erc20TokenContract = await getContractInstance(
        erc20TokenABI,
        info.lpToken
      );
      methods = erc20TokenContract.methods;
      _totalLp = await methods.totalSupply().call();
      _reserves = "0";
      const res = await utils.getTokenPricesFromString(info.lpToken);
      _token0 = res.data ? res.data[info.lpToken.toLowerCase()].usd : 0;
      _token1 = await methods.decimals().call();
      totalLpSupply = await methods.balanceOf(tokensAddress.masterchef).call();
    }

    let totalLocked = new BigNumber(0);
    let isLp = _reserves !== "0";
    const tokenDecimal = isLp ? 18 : _token1;
    let tokenPrice = _token0 === "0" ? 1 : Number(_token0);

    if (isLp) {
      if (_token0.toLowerCase() === tokensAddress.Comp.toLowerCase()) {
        totalLocked = new BigNumber(_reserves._reserve0)
          .div(1e18)
          .times(2)
          .times(dopPrice);
      } else {
        totalLocked = new BigNumber(_reserves._reserve1)
          .div(1e18)
          .times(2)
          .times(dopPrice);
      }
      tokenPrice = new BigNumber(totalLocked)
        .div(new BigNumber(_totalLp).div(10 ** 18))
        .toNumber();
    } else {
      totalLocked = new BigNumber(totalLpSupply)
        .div(10 ** tokenDecimal)
        .times(tokenPrice);
    }
    const result = {
      ...(Pools.find((pool) => pool.id === info.poolId) || {}),
      ...info,
      totalLp: fromWei(_totalLp, tokenDecimal),
      totalLpSupply: fromWei(totalLpSupply, tokenDecimal),
      lpPrice: tokenPrice,
    };
    stakingTVL = stakingTVL.plus(
      new BigNumber(result.totalLpSupply).times(result.lpPrice)
    );
  }
  return stakingTVL.toString(10);
};

const fetch = async () => {
  var res = await utils.fetchURL("https://drops.co/status");
  return res.data ? new BigNumber(res.data.TVL) : 0;
};

const staking = async () => {
  const stakingTVL = await stakedTVL();
  return stakingTVL;
};

module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  staking: {
    fetch: staking
  },
  fetch
};
