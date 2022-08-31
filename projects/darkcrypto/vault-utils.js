const VAULT_ADDR = "0x66D586eae9B30CD730155Cb7fb361e79D372eA2a"
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require("./abi.json")
const farmLPBalance = async (
  chain,
  block,
  lpToken,
  lpLocked,
  token0,
  token1,
  pid
) => {
  const balances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: [
        {
          target: token0,
          params: [lpToken],
        },
        {
          target: token1,
          params: [lpToken],
        }
      ],
      block,
      chain: chain,
    })
  ).output;

  const lpTotalSuply = (
    await sdk.api.abi.call({
      target: lpToken,
      abi: "erc20:totalSupply",
      chain: chain,
      block,
    })
  ).output;
  const token0Locked = (lpLocked * balances[0].output) / lpTotalSuply;
  const token1Locked = (lpLocked * balances[1].output) / lpTotalSuply;
  const unknowPricePid = [0, 1];
  let whiteListToken = ["0x97749c9B61F878a880DfE312d2594AE07AEd7656"]
  whiteListToken = whiteListToken.map(addr=>addr.toLowerCase())
  if (unknowPricePid.includes(pid)) {
    if(whiteListToken.includes(token0.toLowerCase())){
      return [
        { token: `${chain}:${token0}`, locked: new BigNumber(token0Locked || 0).multipliedBy(2) },
      ]
    }
    return [
      { token: `${chain}:${token1}`, locked: new BigNumber(token1Locked || 0).multipliedBy(2) },
    ]
  }

  return [
    { token: `${chain}:${token0}`, locked: token0Locked },
    { token: `${chain}:${token1}`, locked: token1Locked },
  ];
};



const vaultLocked = async (block, chain) => {
  const balances = {};
  const { output: poolLength } = await sdk.api.abi.call({
    abi: abi["poolLength"],
    target: VAULT_ADDR,
    chain,
  })
  let arr = []
  for (let i = 0; i < poolLength; i++) {
    arr.push(i)
  }

  let poolInfos =
    await sdk.api.abi.multiCall({
      abi: abi["poolInfo"],
      calls: arr.map(pid => {
        return {
          target: VAULT_ADDR,
          params: [pid]
        }
      }),
      block,
      chain: chain,
    })
      .then(d => d.output).then(d => d.map(poolInfo => poolInfo.output));
  // console.log(poolInfos)
  let wanLockedTotals =
    await sdk.api.abi.multiCall({
      abi: abi["wantLockedTotal"],
      calls: poolInfos.map(poolInfo => {
        return {
          target: poolInfo.strategy,
          params: []
        }
      }),
      block,
      chain: chain,
    })
      .then(d => d.output).then(d => d.map(lock => lock.output));
  let token0Infos =
    await sdk.api.abi.multiCall({
      abi: abi["token0"],
      calls: poolInfos.map(poolInfo => {
        return {
          target: poolInfo.want,
          params: []
        }
      }),
      block,
      chain: chain,
    })
      .then(d => d.output).then(d => d.map(lock => lock.output));
  let token1Infos =
    await sdk.api.abi.multiCall({
      abi: abi["token1"],
      calls: poolInfos.map(poolInfo => {
        return {
          target: poolInfo.want,
          params: []
        }
      }),
      block,
      chain: chain,
    })
      .then(d => d.output).then(d => d.map(lock => lock.output));
  const promises = arr.map((i) => {
    return farmLPBalance(
      "cronos",
      block,
      poolInfos[i].want,
      wanLockedTotals[i],
      token0Infos[i],
      token1Infos[i],
      i
    );
  });
  const data = await Promise.all(promises);
  data.forEach((farm) => {
    farm.forEach((item) => {
      balances[item.token] = new BigNumber(balances[item.token] || 0)
        .plus(item.locked || 0)
        .toFixed(0);
    });
  });

  return balances;
};
module.exports = {
  vaultLocked,
};
