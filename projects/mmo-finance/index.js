const sdk = require("@defillama/sdk");
const abi = 'function tvlOfPool(address pool) view returns (uint256 tvl)';
const genericVaultBalance = "uint256:balance"
const valueOfAsset = 'function valueOfAsset(address asset, uint256 amount) view returns (uint256 valueInCRO, uint256 valueInUSD)'
const BigNumber = require("bignumber.js");

const dashboardCronos = "0x55f040E3A6e0ff69f5095B3cbF458919C5e02A0B";
const calculator = "0xa2B417088D63400d211A4D5EB3C4C5363f834764"

const poolsCronos = [
  "0x443ec402BeC44dA7138a54413b6e09037Cf9CF41",
 "0xB130a35acD62eb4604c6Ba6479D660D97a0A5aBE",
 "0xD2B3BDd43Bf5f6f28bD8b12d432afA46a3B20234",
 "0x08d7EBb6fd9dC10EA21a6AA788693aB763616951",
 "0xe4bc967855Eb076fA971a40c0Aa4B16Ba206aec2",
 "0xFf89646FE7Ee62EA96050379A7A8c532dD431d10",
 "0xe2ca90FC315356DecF71133Ba5938153596433f3",
 "0x7A42441f5Cf40cF0fBdA98F494fA2cc500177e86",
 "0x55B5540B5C48a27FD17ebe2B9E6a06911f8aa45A",
 "0x00Db5925892274F276846F25C7fE81DEc3F3B769",
 "0x34375b4c4094eCaAb494E22DFFe1f88f1D5143af",
 "0x7D35398F35F1dAD6e7a48d6f6E470CB11C77fc46",
];

const specialPools = [
  "0xcA37dcfC10D0366DBA41B19e9EBe7354bbF1aEC2", //METF - MMF 
  "0x1B27765F0606904eD8ebB5a915df22981ea4A261", //MSHARE-MMF 
  "0xc385C326133078Be00cd32D3587c21934E29c2aB", //SVN-MMF 
]

const staking = [
  "0x692db42F84bb6cE6A6eA62495c804C71aA6887A7", //MMO single sided
  "0xe4bc967855Eb076fA971a40c0Aa4B16Ba206aec2", //VVS single
  "0x443ec402BeC44dA7138a54413b6e09037Cf9CF41", //MMF single
]

const vaultsLPAddresses = ["0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7",
"0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677",
  "0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0",
]

const vaultToLP = {
  "0xcA37dcfC10D0366DBA41B19e9EBe7354bbF1aEC2": "0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7",
  "0x1B27765F0606904eD8ebB5a915df22981ea4A261": "0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677",
  "0xc385C326133078Be00cd32D3587c21934E29c2aB": "0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0"
}

const ZERO = new BigNumber(0);
const ETHER = new BigNumber(10).pow(18);

async function fetchSavannaLPPrice(timestamp, ethBlock, chainBlock) {
  const mmfBalance = {}
  const block = chainBlock.cronos;

  let data1 = await sdk.api.abi.multiCall({
    calls: vaultsLPAddresses.map((address) => ({
      target: "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
      params: address,
    })),
    block,
    abi: 'erc20:balanceOf',
    chain: "cronos",
  })

  data1.output.forEach((call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      mmfBalance[call.input.params[0]] = value.dividedBy(ETHER);
    }
  });

  const totalSupply = {}

  let data2 = await sdk.api.abi.multiCall({
    calls: vaultsLPAddresses.map((address) => ({
      target: address,
      params: [],
    })),
    block,
    abi: 'erc20:totalSupply',
    chain: "cronos",
  })

  data2.output.forEach((call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      totalSupply[call.input.target] = value.dividedBy(ETHER);
    }
  });

  let priceOfMMF = 0;
  let data3 = await sdk.api.abi.multiCall({
    calls: [{
      target: calculator,
      params: ["0x97749c9B61F878a880DfE312d2594AE07AEd7656", "1000000000000000000"],
    }],
    block,
    abi: valueOfAsset,
    chain: "cronos",
  });
  data3.output.forEach((call) => {
    let value = call && call.output && new BigNumber(call.output.valueInUSD);
    if (value) {
      priceOfMMF = value.dividedBy(ETHER);
    }
  });
  const finalLPPrices = {}
  Object.keys(mmfBalance).forEach(x => {
    finalLPPrices[x] = mmfBalance[x].dividedBy(totalSupply[x]).times(priceOfMMF).times(2);
  })
  return finalLPPrices
}

async function TVLPool(timestamp, ethBlock, chainBlock) {
  const block = chainBlock.cronos;
  try {

    let LPPRices = await fetchSavannaLPPrice(timestamp, ethBlock, chainBlock);

    const specialBalance = {}
    let data1 = await sdk.api.abi.multiCall({
      calls: specialPools.map((address) => ({
        target: address,
        params: [],
      })),
      block,
      abi: genericVaultBalance,
      chain: "cronos",
    })

    const total2 = data1.output.reduce((tvl, call) => {
      let value = call && call.output && new BigNumber(call.output);
      if (value) {
        specialBalance[call.input.target] = value.dividedBy(ETHER) * LPPRices[vaultToLP[call.input.target]];
        return tvl.plus(value.dividedBy(ETHER) * LPPRices[vaultToLP[call.input.target]]);
      }
    }, ZERO);

    const total = (
      await sdk.api.abi.multiCall({
        calls: poolsCronos.map((address) => ({
          target: dashboardCronos,
          params: address,
        })),
        block,
        abi: abi,
        chain: "cronos",
      })
    ).output.reduce((tvl, call) => {
      let value = call && call.output && new BigNumber(call.output);
      if (value) {
        return tvl.plus(value.dividedBy(ETHER));
      }
      return tvl;
    }, ZERO);

    return {
      tether: total.plus(total2).toNumber(),
    };
  } catch (err) {
    console.error(err)
  }
}

async function singleStaking(timestamp, ethBlock, chainBlock) {
  const block = chainBlock.cronos;
  const total = (
    await sdk.api.abi.multiCall({
      calls: staking.map((address) => ({
        target: dashboardCronos,
        params: address,
      })),
      block,
      abi: abi,
      chain: "cronos",
    })
  ).output.reduce((tvl, call) => {
    let value = call && call.output && new BigNumber(call.output);
    if (value) {
      return tvl.plus(value.dividedBy(ETHER));
    }
    return tvl;
  }, ZERO);

  return {
    tether: total.toNumber(),
  };
}

module.exports = {
  methodology: `Total value in pools`,
  misrepresentedTokens: true,
  cronos: {
    tvl: TVLPool,
    staking: singleStaking
  },
};
