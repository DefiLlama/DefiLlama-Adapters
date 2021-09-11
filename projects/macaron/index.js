const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");

const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const MasterChefContract = "0xFcDE390bF7a8B8614EC11fa8bde7565b3E64fe0b";

const chocoChefAddresses = [
  "0xF60EDbF7D95E79878f4d448F0CA5622479eB8790",
  "0xCded81aa5Ab3A433CadF77Fd5aC8B6fD973906e1",
  "0xc8De98F603af53a5D52AF6AA153d9e15b0002B2c",
  "0xC85C50988AEC8d260853443B345CAE63B7432b7A",
  "0x7DB34B681c759918079C67EeF08868225F34fbcB",
  "0x0f819C8E6A7c0F0906CBc84b9b1e6642f9634E61",
  "0x903A20CDbAC174250eAcc7437720929f0dE97B99",
];

const vaultsOnMacaron = [
  //BakeVaultOnMacaron
  "0xBB7ac3eB02c6d012cc8e2d916678De8843Eb8A56",
  //CakeVaultOnMacaron
  "0xCd59d44E94Dec10Bb666f50f98cD0B1593dC3a3A",
  //BananaVaultOnMacaron
  "0xd474366F6c80230507481495F3C1490e62E3093F",
];

const ERC20s = [
  //MCRN
  "0xacb2d47827c9813ae26de80965845d80935afd0b",
  //BANANA
  "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
  //CAKE
  "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
];

const treasuryAddress = "0x67f1D48a8991009e0b092e9C34ca16f7d6072ec1";

/*** Treasury ***/
const Treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformBscAddress();

  for (const token of ERC20s) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [treasuryAddress],
      chainBlocks["bsc"],
      "bsc",
      transformAddress
    );
  }
  return balances;
};

const calcTvl = async (
  balances,
  chain,
  block,
  stakingToken,
  balance,
  addresses
) => {
  const token = (
    await sdk.api.abi.multiCall({
      abi: stakingToken,
      calls: addresses.map((addr) => ({
        target: addr,
      })),
      chain,
      block,
    })
  ).output.map((addr) => addr.output);

  const balanceOfToken = (
    await sdk.api.abi.multiCall({
      abi: balance,
      calls: addresses.map((bal) => ({
        target: bal,
      })),
      chain,
      block,
    })
  ).output.map((b) => b.output);

  for (let index = 0; index < addresses.length; index++) {
    sdk.util.sumSingleBalance(
      balances,
      `bsc:${token[index]}`,
      balanceOfToken[index]
    );
  }
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  // --- Staking LPs on Magic Box Tvl portion ---
  const lengthOfPool = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MasterChefContract,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < lengthOfPool; index++) {
    const lpOrToken = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MasterChefContract,
        params: index,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output.lpToken;

    const lpOrToken_Bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: lpOrToken,
        params: MasterChefContract,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    if (index == 0) {
      sdk.util.sumSingleBalance(balances, `bsc:${lpOrToken}`, lpOrToken_Bal);
    } else {
      lpPositions.push({
        token: lpOrToken,
        balance: lpOrToken_Bal,
      });
    }
  }

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  // --- Staking Tokens by Choco Falls Tvl portion ---
  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    abi.stakingToken,
    abi.lpSupply,
    chocoChefAddresses
  );

  // --- Vaults of other Protocols on Macaron (Boost Pools) Tvl portion ---
  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    abi.token,
    abi.balanceOf,
    vaultsOnMacaron
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  Treasury: {
    tvl: Treasury,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology: `We add as TVL the staking LPs on Magic Box by Masterchef contract; the staking Assets on Choco Falls 
  by ChocoChef Contract; and the Vaults of other protocols on Macaron by Boost Pools. 
  The treasury part separated from TVL`,
};
