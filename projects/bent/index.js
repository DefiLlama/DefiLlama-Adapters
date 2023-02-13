const sdk = require("@defillama/sdk");

const basePoolAbi = require("./bentBasePoolAbi.json");
const curveRegistryAbi = require("./curveRegistryAbi.json");
const curvePoolAbi = require("./curvePoolAbi.json");
const BigNumber = require("bignumber.js");
const {
  bentPools,
  crvPoolByLpTokenAddress,
  crvRegistry,
  addressZero,
  ethAddress,
  wethAddress,
  bentMasterChefAddress,
  bentMasterChefPools,
  bentCVXAddress,
  CVXAddress,
  weBent,
  bentCVXSingleStaking,
  pool2Address,
  sushiLpAddress,
  bentAddress,
  daiAddress,
} = require("./constants");

async function tvl(timestamp, block) {
  const poolAddresses = Object.values(bentPools);
  const poolBalances = [];

  const bentCVXpriceInCVX = new BigNumber(
    (
      await sdk.api.abi.call({
        target: bentMasterChefPools[0],
        abi: curvePoolAbi.get_dy,
        params: [1, 0, new BigNumber(1).times(10 ** 18).toString()],
        block,
      })
    ).output
  ).dividedBy(10 ** 18);

  // Fetch balances of each of the pools
  await Promise.all(poolAddresses.map(async (_, poolIndex) => {
    {
      const poolAddress = poolAddresses[poolIndex];
      const masterChefPoolIndex = bentMasterChefPools.indexOf(poolAddress);
      const isMasterChefPool = masterChefPoolIndex !== -1;
      let poolSupply, poolLpToken;

      if (!isMasterChefPool) {
        const results = (
          await Promise.all([
            sdk.api.erc20.totalSupply({
              target: poolAddress,
              block,
            }),
            sdk.api.abi.call({
              target: poolAddress,
              abi: basePoolAbi.lpToken,
              block,
            }),
          ])
        ).map((p) => p.output.toLowerCase());
        poolSupply = results[0];
        poolLpToken = results[1];
      } else {
        poolLpToken = poolAddress;
        poolSupply = (
          await sdk.api.erc20.balanceOf({
            target: poolLpToken,
            owner: bentMasterChefAddress,
            block,
          })
        ).output;
      }

      const lpTokenTotalSupply = (
        await sdk.api.erc20.totalSupply({
          target: poolLpToken,
          block,
        })
      ).output;

      // Find the curve pool
      let crvPoolAddr = (
        await sdk.api.abi.call({
          target: crvRegistry,
          abi: curveRegistryAbi.get_pool_from_lp_token,
          params: poolLpToken,
          block,
        })
      ).output;

      // Find the balance of the underlying coins in the curve pool
      let coins = [];
      if (crvPoolAddr !== addressZero) {
        coins = (
          await sdk.api.abi.call({
            target: crvRegistry,
            abi: curveRegistryAbi.get_coins,
            params: crvPoolAddr,
            block,
          })
        ).output.filter((a) => a !== addressZero);
      } else {
        // Either use a manual mapping, or the pool is the lp token itself.
        crvPoolAddr = crvPoolByLpTokenAddress[poolLpToken] || poolLpToken;
        for (let i = 0, err = false; i < 8 && !err; i++) {
          try {
            let coin = (
              await sdk.api.abi.call({
                target: crvPoolAddr,
                abi: curvePoolAbi.coins,
                params: i,
              })
            ).output;
            coins.push(coin);
          } catch (e) {
            err = true;
          }
        }
      }

      const includesEth =
        coins.findIndex(
          (addr) =>
            addr.toLowerCase() === ethAddress ||
            addr.toLowerCase() === wethAddress
        ) !== -1;

      /**
       * addr : balance for the curve pool
       */
      let curvePoolBalances = (
        await sdk.api.abi.multiCall({
          calls: coins
            .filter((addr) => addr.toLowerCase() !== ethAddress)
            .map((coinAddr) => ({
              target: coinAddr,
              params: crvPoolAddr,
            })),
          abi: "erc20:balanceOf",
          block,
        })
      ).output.reduce((curvePoolBalances, { success, input, output }) => {
        if (!success) return curvePoolBalances;

        curvePoolBalances[input.target] = output;
        return curvePoolBalances;
      }, {});

      if (includesEth) {
        var ethbal = await sdk.api.eth.getBalance({
          target: crvPoolAddr,
          block,
        });
        curvePoolBalances[addressZero] = ethbal.output;
      }

      // Calculate the share of the pool we have.
      const poolShare = BigNumber(poolSupply).div(lpTokenTotalSupply);
      const ourBalances = {};
      Object.keys(curvePoolBalances).forEach((coinAddr) => {
        let poolBalance = curvePoolBalances[coinAddr];
        ourBalances[coinAddr] = new BigNumber(poolBalance)
          .times(poolShare)
          .toFixed(0);
      });
      poolBalances.push(ourBalances);
    }
  }))

  const balances = poolBalances.reduce((overallBalances, poolBalances) => {
    Object.keys(poolBalances).forEach((tokenAddress) => {
      let current = new BigNumber(overallBalances[tokenAddress] || "0");
      let pool = new BigNumber(poolBalances[tokenAddress] || "0");
      if (tokenAddress.toLowerCase() === bentCVXAddress.toLowerCase()) {
        tokenAddress = CVXAddress.toLowerCase();
        pool = pool.times(bentCVXpriceInCVX);
      }
      overallBalances[tokenAddress] = current.plus(pool).toFixed(0);
    });
    return overallBalances;
  }, {});

  // Add single sided bentCVX staking:
  const stakedBentCVX = (
    await sdk.api.erc20.balanceOf({
      target: bentCVXAddress,
      owner: bentCVXSingleStaking,
      block,
    })
  ).output;

  balances[CVXAddress] = new BigNumber(balances[CVXAddress] || 0).plus(
    new BigNumber(stakedBentCVX).times(bentCVXpriceInCVX)
  );

  return balances;
}

async function pool2(timestamp, block) {
  const pool2Balance = (
    await sdk.api.erc20.balanceOf({
      target: sushiLpAddress,
      owner: pool2Address,
      block,
    })
  ).output;

  const lpTotalSupply = (
    await sdk.api.erc20.totalSupply({
      target: sushiLpAddress,
      block,
    })
  ).output;

  const share = new BigNumber(pool2Balance).dividedBy(lpTotalSupply);

  const [daiBalance, bentBalance] = (
    await sdk.api.abi.multiCall({
      calls: [
        { target: daiAddress, params: sushiLpAddress },
        { target: bentAddress, params: sushiLpAddress },
      ],
      abi: "erc20:balanceOf",
      block,
    })
  ).output.map(({ output }) => new BigNumber(output).times(share));

  return {
    [daiAddress]: daiBalance.toFixed(0),
    [bentAddress]: bentBalance.toFixed(0),
  };
}

async function staking(timestamp, block) {
  const stakingBalance = (
    await sdk.api.erc20.balanceOf({
      target: bentAddress,
      owner: weBent,
      block,
    })
  ).output;

  return {
    [bentAddress]: stakingBalance,
  };
}

module.exports = {
  methodology: `TVL:BENT allows users to stake their curve LP tokens. For each supported curve pool LP token: Find the total supply of the LP token, Find the balance of LP staked in bent, Find the curve pool whose liquidity it represents, Enumerate the addresses of each token that makes up the pool, Get the balance of each token from 4, Use 1 & 2 to work out the LP share staked in bent, Multiply the token balances from 5 by the bent share to get the bent balances. Pool2 and staking: Pool2 and staking are fairly standard. Pool2 calculates fraction of LP staked as a share of the sushi LP and multiplies by the sushi LP coin balances. Staking simply takes the balance of the staking contract for BENT.`,
  ethereum: {
    tvl,
    pool2,
    staking,
  },
};
