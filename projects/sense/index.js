const sdk = require("@defillama/sdk");

const DIVIDER = "0x86bA3E96Be68563E41c2f5769F1AF9fAf758e6E0";
const SPACE_FACTORY = "0x5f6e8e9C888760856e22057CBc81dD9e0494aA34";
const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const DIVIDER_INIT_BLOCK = 14427177;
const DIVIDER_INIT_TS = 1647831440;

// Converts a bytes32 into an address or, if there is more data, slices an address out of the first 32 byte word
const toAddress = (data) => `0x${data.slice(64 - 40 + 2, 64 + 2)}`;

async function tvl(_time, block) {
  const balances = {};
  const adapterTargetCache = {};

  const { output: seriesLogs } = await sdk.api.util.getLogs({
    target: DIVIDER,
    topic: "SeriesInitialized(address,uint256,address,address,address,address)",
    keys: [],
    toBlock: block,
    fromBlock: DIVIDER_INIT_BLOCK,
  });

  const series = seriesLogs.reduce((acc, cur) => {
    const adapter = toAddress(cur.data);
    const maturity = parseInt(cur.topics[1]); // safe to parse uint32 timestamp
    if (acc[adapter]) {
      acc[adapter].push(maturity);
      acc[adapter].sort();
      return acc;
    } else {
      return { ...acc, [adapter]: [maturity] };
    }
  }, {});

  // SENSE ADAPTER TVL ---
  for (const adapterAddress of Object.keys(series)) {
    const { output: targetAddress } = await sdk.api.abi.call({
      abi: abi.target,
      target: adapterAddress,
      params: [],
      block: "latest",
    });

    adapterTargetCache[adapterAddress] = targetAddress;

    const { output: adapterTokenBalance } = await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      target: targetAddress,
      params: [adapterAddress],
      block,
    });

    sdk.util.sumSingleBalance(
      balances,
      targetAddress,
      adapterTokenBalance
    );
  }

  // SPACE POOL TVL ---
  for (const [adapterAddress, maturities] of Object.entries(series)) {
    const targetAddress = adapterTargetCache[adapterAddress];
    for (const maturity of maturities) {
      const { output: poolAddress } = await sdk.api.abi.call({
        abi: abi.pools,
        target: SPACE_FACTORY,
        params: [adapterAddress, maturity],
        block: "latest",
      });

      let { output: pti } = await sdk.api.abi.call({
        target: poolAddress,
        abi: abi.pti,
        block: "latest",
      });
      pti = parseInt(pti);

      const { output: poolId } = await sdk.api.abi.call({
        target: poolAddress,
        abi: abi.getPoolId,
        block: "latest",
      });

      const {
        output: { balances: poolBalances },
      } = await sdk.api.abi.call({
        abi: abi.getPoolTokens,
        target: BALANCER_VAULT,
        params: [poolId],
        block,
      });

      sdk.util.sumSingleBalance(
        balances,
        targetAddress,
        poolBalances[1 - pti]
      );
    }
  }

  return balances;
}

module.exports = {
  timetravel: true,
  doublecounted: true,
  misrepresentedTokens: false,
  methodology:
    "TVL is comprised of the sum of yield-bearing assets in Sense, which includes those assets being used both 1) to issue fixed term Sense tokens (PTs/YTs) and 2) as reserves in our Space AMM Pools. Data is collected via the DeFi Llama SDK.",
  start: DIVIDER_INIT_TS,
  ethereum: {
    tvl,
  },
};

const abi = {
  target: {
    inputs: [],
    name: "target",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  pools: {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "pools",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  getPoolId: {
    inputs: [],
    name: "getPoolId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  pti: {
    inputs: [],
    name: "pti",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  getPoolTokens: {
    inputs: [
      {
        internalType: "bytes32",
        name: "poolId",
        type: "bytes32",
      },
    ],
    name: "getPoolTokens",
    outputs: [
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "balances",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "lastChangeBlock",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};
