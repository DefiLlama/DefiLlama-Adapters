const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { pool2s } = require("../helper/pool2");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const deepLockLockerContractV1 = "0x10dD7FD1Bf3753235068ea757f2018dFef94B257";
const deepLockLockerContractV2 = "0x3f4D6bf08CB7A003488Ef082102C2e6418a4551e";

const stakingPool2Contracts = [
  "0x27F33DE201679A05A1a3ff7cB40a33b4aA28758e",
  "0x03dab688d32507B53Cc91265FA47760b13941250",
];
const lpAddresses = [
  "0xc1fccf4170fa9126d6fb65ffc0dd5a680a704094",
  "0x596e48cde23ba55adc2b8b00b4ef472184e2a9e3",
];

const calcTvl = async (balances, contractLocker, chain) => {
  let chainBlocks = {};

  const lengthOfIds = (
    await sdk.api.abi.call({
      abi: abi.depositId,
      target: contractLocker,
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  const lpPositions = [];

  for (let id = 1; id <= lengthOfIds; id++) {
    const getToken = (
      await sdk.api.abi.call({
        abi: abi.lockedToken,
        target: contractLocker,
        params: id,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output.tokenAddress;

    const getAmount = (
      await sdk.api.abi.call({
        abi: abi.lockedToken,
        target: contractLocker,
        params: id,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output.tokenAmount;

    const getSymbol = (
      await sdk.api.abi.call({
        abi: abi.symbol,
        target: getToken,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output;

    if (getSymbol.includes("LP")) {
      lpPositions.push({
        token: getToken,
        balance: getAmount,
      });
    } else {
      sdk.util.sumSingleBalance(balances, `${chain}:${getToken}`, getAmount);
    }
  }

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    transformAddress
  );
};

const bscTvl = async () => {
  const balances = {};

  await calcTvl(balances, deepLockLockerContractV1, "bsc");
  await calcTvl(balances, deepLockLockerContractV2, "bsc");

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    pool2: pool2s(stakingPool2Contracts, lpAddresses, "bsc"),
    tvl: bscTvl,
  },
  methodology:
    "Counts tvl of all the tokens locked on the locker through DeepLockLocker Contracts",
};
