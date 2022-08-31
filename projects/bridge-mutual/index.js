const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const {
  transformBscAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens");

const addresses = {
  ethereum: {
    CapitalPool: "0x426f72ab027da5f5a462d377a5eb057f63082b02",
    BMIStaking: "0x55978a6f6a4cfa00d5a8b442e93e42c025d0890c",
    ClaimVoting: "0x81d73999fabec7e8355d76d1010afbe3068f08fa",
    PolicyBookRegistry: "0xff13c3d2c7931e86e13c993a8cb02d68848f9613",
    ShieldMining: "0x6d6fCf279a63129797def89dBA82a65b3386497e",
    usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    bmi: "0x725c263e32c72ddc3a19bea12c5a0479a81ee688",
  },
  bsc: {
    CapitalPool: "0x7fe3b7d89a982b3821d8fa2c93a1b87f87f00e80",
    BMIStaking: "0x0000000000000000000000000000000000000000",
    ClaimVoting: "0x8be37f9bb9b09cf89774c103c52d1e660398a7b3",
    PolicyBookRegistry: "0xab7c7356f706954c3c926a690e96c7b65fa76116",
    ShieldMining: "0xcc75bf59969e8362d064536fd941a541f81abe56",
    usdt: "0x55d398326f99059fF775485246999027B3197955",
    bmi: "0xb371f0eb8dfb3b47fdfc23bbcbc797954d3d4f23",
  },
  polygon: {
    CapitalPool: "0xb7594fc3e0a044b4aeeb910c3258ed24f3114006",
    BMIStaking: "0x0000000000000000000000000000000000000000",
    ClaimVoting: "0xcfdb12299c2d0111ae1cee23337e9156deabfbf5",
    PolicyBookRegistry: "0xab7c7356f706954c3c926a690e96c7b65fa76116",
    ShieldMining: "0xde52f95ea3373fab1deefde56d35fa1dacd83e99",
    usdt: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    bmi: "0xa10facae1abac4fae6312c615a9c3fd56075be1a",
  },
};

// =================== GET LIST OF POLICY BOOKS =================== //
async function getPolicyBookList(
  timestamp,
  chainBlocks,
  chain,
  PolicyBookRegistry
) {
  const countPolicyBooks = (
    await sdk.api.abi.call({
      target: PolicyBookRegistry,
      abi: abi["count"],
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;
  const listPolicyBooks = (
    await sdk.api.abi.call({
      target: PolicyBookRegistry,
      params: [0, countPolicyBooks],
      abi: abi["list"],
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;
  return listPolicyBooks;
}

async function ethTvl(timestamp, chainBlocks) {
  const chain = "ethereum";
  let balances = {};
  const listPolicyBooks = await getPolicyBookList(
    timestamp,
    chainBlocks,
    chain,
    addresses.ethereum.PolicyBookRegistry
  );

  // =================== GET USDT BALANCES =================== //
  const vusdtBalances = (
    await sdk.api.abi.call({
      target: addresses.ethereum.CapitalPool,
      abi: abi["virtualUsdtAccumulatedBalance"],
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;
  sdk.util.sumSingleBalance(balances, addresses.ethereum.usdt, vusdtBalances);

  // =================== GET TOKENX BALANCES =================== //
  for (let PolicyBook of listPolicyBooks) {
    const tokenX = (
      await sdk.api.abi.call({
        target: addresses.ethereum.ShieldMining,
        params: PolicyBook,
        abi: abi["getShieldTokenAddress"],
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output;
    if (tokenX != "0x0000000000000000000000000000000000000000") {
      const tokenXBalance = await sdk.api.abi.call({
        target: tokenX,
        params: PolicyBook,
        abi: abi["balanceOf"],
        chain: chain,
        block: chainBlocks[chain],
      });
      sdk.util.sumSingleBalance(balances, tokenX, tokenXBalance.output);
    }
  }

  return balances;
}

async function ethStaking(timestamp, chainBlocks) {
  const chain = "ethereum";
  let balances = {};

  // =================== GET BMI BALANCES =================== //
  const bmiPools = [
    addresses.ethereum.BMIStaking,
    addresses.ethereum.ClaimVoting,
  ];

  const bmiBalances = await sdk.api.abi.multiCall({
    target: addresses.ethereum.bmi,
    calls: bmiPools.map((bmiPool) => ({
      params: bmiPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: chainBlocks[chain],
  });
  sdk.util.sumMultiBalanceOf(balances, bmiBalances);

  return balances;
}

async function bscTvl(timestamp, chainBlocks) {
  const chain = "bsc";
  const transform = await transformBscAddress();
  let balances = {};
  const listPolicyBooks = await getPolicyBookList(
    timestamp,
    chainBlocks,
    chain,
    addresses.bsc.PolicyBookRegistry
  );

  // =================== GET USDT BALANCES =================== //
  const vusdtBalances = (
    await sdk.api.abi.call({
      target: addresses.bsc.CapitalPool,
      abi: abi["virtualUsdtAccumulatedBalance"],
      chain: chain,
      block: chainBlocks["chain"],
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    transform(addresses.bsc.usdt),
    vusdtBalances
  );

  // =================== GET TOKENX BALANCES =================== //
  for (PolicyBook of listPolicyBooks) {
    const tokenX = (
      await sdk.api.abi.call({
        target: addresses.bsc.ShieldMining,
        params: PolicyBook,
        abi: abi["getShieldTokenAddress"],
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output;
    if (tokenX != "0x0000000000000000000000000000000000000000") {
      const tokenXBalance = await sdk.api.abi.call({
        target: tokenX,
        params: PolicyBook,
        abi: abi["balanceOf"],
        chain: chain,
        block: chainBlocks[chain],
      });
      sdk.util.sumSingleBalance(
        balances,
        transform(tokenX),
        tokenXBalance.output
      );
    }
  }
  return balances;
}

async function bscStaking(timestamp, chainBlocks) {
  const chain = "bsc";
  let balances = {};

  // =================== GET BMI BALANCES =================== //
  const bmiPools = [addresses.bsc.BMIStaking, addresses.bsc.ClaimVoting];

  const bmiBalances = await sdk.api.abi.multiCall({
    target: addresses.bsc.bmi,
    calls: bmiPools.map((bmiPool) => ({
      params: bmiPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: chainBlocks[chain],
  });
  sdk.util.sumMultiBalanceOf(balances, bmiBalances);

  return balances;
}

async function polTvl(timestamp, chainBlocks) {
  const chain = "polygon";
  const transform = await transformPolygonAddress();
  let balances = {};
  const listPolicyBooks = await getPolicyBookList(
    timestamp,
    chainBlocks,
    chain,
    addresses.polygon.PolicyBookRegistry
  );

  // =================== GET USDT BALANCES =================== //
  const vusdtBalances = (
    await sdk.api.abi.call({
      target: addresses.polygon.CapitalPool,
      abi: abi["virtualUsdtAccumulatedBalance"],
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    transform(addresses.polygon.usdt),
    vusdtBalances
  );

  // =================== GET TOKENX BALANCES =================== //
  for (PolicyBook of listPolicyBooks) {
    const tokenX = (
      await sdk.api.abi.call({
        target: addresses.polygon.ShieldMining,
        params: PolicyBook,
        abi: abi["getShieldTokenAddress"],
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output;
    if (tokenX != "0x0000000000000000000000000000000000000000") {
      const tokenXBalance = await sdk.api.abi.call({
        target: tokenX,
        params: PolicyBook,
        abi: abi["balanceOf"],
        chain: chain,
        block: chainBlocks[chain],
      });
      sdk.util.sumSingleBalance(
        balances,
        transform(tokenX),
        tokenXBalance.output
      );
    }
  }

  return balances;
}

async function polStaking(timestamp, chainBlocks) {
  const chain = "polygon";
  let balances = {};

  // =================== GET BMI BALANCES =================== //
  const bmiPools = [
    addresses.polygon.BMIStaking,
    addresses.polygon.ClaimVoting,
  ];

  const bmiBalances = await sdk.api.abi.multiCall({
    target: addresses.polygon.bmi,
    calls: bmiPools.map((bmiPool) => ({
      params: bmiPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: chainBlocks[chain],
  });
  sdk.util.sumMultiBalanceOf(balances, bmiBalances);

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: ethStaking,
  },
  bsc: {
    tvl: bscTvl,
    staking: bscStaking,
  },
  polygon: {
    tvl: polTvl,
    staking: polStaking,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, bscTvl, polTvl]),
};
