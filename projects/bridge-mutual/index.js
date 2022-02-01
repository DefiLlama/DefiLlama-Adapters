const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const chain = "ethereum";

// addresses pools
const CapitalPool = "0x426f72ab027da5f5a462d377a5eb057f63082b02";
const ReinsurancePool = "0x6bcca719884fbf988924f55bb5d1e0c8f98d0d5b";
const BMIStaking = "0x55978a6f6a4cfa00d5a8b442e93e42c025d0890c";
const ClaimVoting = "0x81d73999fabec7e8355d76d1010afbe3068f08fa";
const BMICoverStaking = "0x589f479b5d5f1297272c8977416ef44b6d5eb03b";
// addresses tokens
const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const bmi = "0x725c263e32c72ddc3a19bea12c5a0479a81ee688";
const stkBmi = "0x83e293589bdc7202fc5c465c70b25cb6bb1f03f2";
const vbmi = "0x9dd9e2b26f75d42437582fcb354d567556343dae";
// addresses getters
const PolicyBookRegistry = "0xff13c3d2c7931e86e13c993a8cb02d68848f9613";
const ShieldMining = "0x6d6fCf279a63129797def89dBA82a65b3386497e";

// =================== GET LIST OF POLICY BOOKS =================== //
async function getPolicyBookList(timestamp, block) {
  const countPolicyBooks = (
    await sdk.api.abi.call({
      target: PolicyBookRegistry,
      abi: abi["count"],
      chain: chain,
      block: block,
    })
  ).output;
  const listPolicyBooks = (
    await sdk.api.abi.call({
      target: PolicyBookRegistry,
      params: [0, countPolicyBooks],
      abi: abi["list"],
      chain: chain,
      block: block,
    })
  ).output;
  return listPolicyBooks;
}

async function tvl(timestamp, block) {
  let balances = {};
  const listPolicyBooks = await getPolicyBookList(timestamp, block);

  // =================== GET USDT BALANCES =================== //
  const usdtPools = [CapitalPool, ReinsurancePool, ...listPolicyBooks];
  const usdtBalances = await sdk.api.abi.multiCall({
    target: usdt,
    calls: usdtPools.map((usdtPool) => ({
      params: usdtPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: block,
  });
  sdk.util.sumMultiBalanceOf(balances, usdtBalances);

  // =================== GET TOKENX BALANCES =================== //
  for (PolicyBook of listPolicyBooks) {
    const tokenX = (
      await sdk.api.abi.call({
        target: ShieldMining,
        params: PolicyBook,
        abi: abi["getShieldTokenAddress"],
        chain: chain,
        block: block,
      })
    ).output;
    if (tokenX != "0x0000000000000000000000000000000000000000") {
      const tokenXBalance = await sdk.api.abi.call({
        target: tokenX,
        params: PolicyBook,
        abi: abi["balanceOf"],
        chain: chain,
        block: block,
      });
      sdk.util.sumSingleBalance(balances, tokenX, tokenXBalance.output);
    }
  }
  // ============================================================ //
  return balances;
}

async function staking(timestamp, block) {
  let balances = {};

  const listPolicyBooks = await getPolicyBookList(timestamp, block);

  // =================== GET BMI BALANCES =================== //
  const bmiPools = [BMIStaking, ClaimVoting];

  const bmiBalances = await sdk.api.abi.multiCall({
    target: bmi,
    calls: bmiPools.map((bmiPool) => ({
      params: bmiPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: block,
  });
  sdk.util.sumMultiBalanceOf(balances, bmiBalances);

  /*// =================== GET BMIXCOVER BALANCES =================== //
  for (PolicyBook of listPolicyBooks) {
    const bmixCoverBalance = await sdk.api.abi.call({
      target: PolicyBook,
      params: BMICoverStaking,
      abi: abi["balanceOf"],
      chain: chain,
      block: block,
    });
    sdk.util.sumSingleBalance(balances, PolicyBook, bmixCoverBalance.output);
  }

  // =================== GET stkBMI BALANCES =================== //
  const stkBmiBalance = await sdk.api.abi.call({
    target: stkBmi,
    params: vbmi,
    abi: abi["balanceOf"],
    chain: chain,
    block: block,
  });
  balances[stkBmi] = stkBmiBalance.output;
  */
  // ============================================================ //
  return balances;
}

module.exports = {
  ethereum: {
    tvl: tvl,
    staking: staking,
  },
};
