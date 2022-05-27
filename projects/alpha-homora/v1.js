const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const axios = require("axios");
const BigNumber = require("bignumber.js");

module.exports = {
    tvlV1Eth,
    tvlV1Bsc
}

async function tvlV1Eth(timestamp, block) {
    const startTimestamp = 1602054167;
    const startBlock = 11007158;
  
    if (timestamp < startTimestamp || block < startBlock) {
      return BigNumber(0);
    }
    return tvlV1("ethereum", block, "https://homora.alphafinance.io/static/contracts.json", "WETHAddress", "totalETH")
}

const wBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
async function tvlV1Bsc(timestamp, block, chainBlocks) {
    const tvlBNB = await tvlV1("bsc", chainBlocks.bsc, "https://homora-bsc.alphafinance.io/static/contracts.json", "WBNBAddress", "totalBNB")
    return {
        ["bsc:"+wBNB]: tvlBNB.toFixed(0)
    }
}

async function tvlV1(chain, block, contractsUrl, wrappedBaseName, totalEthMethodName) {
    const { data } = await axios.get(
      contractsUrl
    );
  
    const bankAddress = data.bankAddress.toLowerCase();
    const WETHAddress = data[wrappedBaseName].toLowerCase();
  
    let pools = data.pools;
  
    const uniswapPools = pools.filter(
      (pool) => pool.id === undefined
    );
  
    const sushiswapPools = pools.filter(
      (pool) => pool.id !== undefined
    );
    pools = [...uniswapPools, ...sushiswapPools];
  
    const { output: _totalETH } = await sdk.api.abi.call({
      target: bankAddress,
      block,
      chain,
      abi: {
          ...abi["totalETH"],
          name: totalEthMethodName
        },
    });
  
    const totalETH = BigNumber(_totalETH);
  
    const { output: _totalDebt } = await sdk.api.abi.call({
      target: bankAddress,
      block,
      chain,
      abi: abi["glbDebtVal"],
    });
  
    const totalDebt = BigNumber(_totalDebt);
  
    // Uniswap Pools
    const { output: _UnilpTokens } = await sdk.api.abi.multiCall({
      calls: uniswapPools.map((pool) => ({
        target: pool.lpStakingAddress,
        params: [pool.goblinAddress],
      })),
      chain,
      abi: abi["balanceOf"],
      block,
    });
  
    // Sushiswap Pools
    const { output: _SushilpTokens } = await sdk.api.abi.multiCall({
      calls: sushiswapPools.map((pool) => ({
        target: pool.lpStakingAddress,
        params: [pool.id, pool.goblinAddress],
      })),
      chain,
      abi: abi["userInfo"],
      block,
    });
  
    const _lpTokens = [
      ..._UnilpTokens,
      ..._SushilpTokens.map((x) => ({
        output: x.output[0],
      })),
    ];
  
    const lpTokens = _lpTokens.map((_lpToken) => BigNumber(_lpToken.output || 0));
  
    const { output: _totalETHOnStakings } = await sdk.api.abi.multiCall({
      calls: pools.map((pool) => ({
        target: WETHAddress,
        params: [pool.lpTokenAddress],
      })),
      chain,
      abi: abi["balanceOf"],
      block,
    });
  
    const totalETHOnStakings = _totalETHOnStakings.map((stake) =>
      BigNumber(stake.output || 0)
    );
  
    const { output: _totalLpTokens } = await sdk.api.abi.multiCall({
      calls: pools.map((pool) => ({
        target: pool.lpTokenAddress,
      })),
      chain,
      abi: abi["totalSupply"],
      block,
    });
  
    const totalLpTokens = _totalLpTokens.map((_totalLpToken) =>
      BigNumber(_totalLpToken.output || 0)
    );
  
    const unUtilizedValue = totalETH.minus(totalDebt);
  
    let tvl = BigNumber(unUtilizedValue);
    for (let i = 0; i < lpTokens.length; i++) {
      if (totalLpTokens[i].gt(0)) {
        const amount = lpTokens[i]
          .times(totalETHOnStakings[i])
          .div(totalLpTokens[i])
          .times(BigNumber(2));
  
        tvl = tvl.plus(amount);
      }
    }
    return tvl;
  }