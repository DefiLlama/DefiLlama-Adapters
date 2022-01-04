const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const stakingABI = require("./staking.json");
const vaultABI = require("./vault.json");

const stakingContract = "0x73feaa1eE314F8c655E354234017bE2193C9E24E";
const vaults = [
  "0x4E5f611A964806c5fb79Aa0dC8cf945cDFdaa7E2",
  "0xBf3aa34aC3F6ea54DD0eC15e5011e0B5A09c17f1",
  "0x925697B5E8F9b1277ca9d94769E10C4cBf1676f5",
  "0x82089743e90562D001FECCE2EeF465a609829459",
  "0x4675D999c1896ADD7D839F090703269b721eD411",
  "0x92f8a3780D479DCaaeb85D84B9dB2296B96B8603",
  "0x3a8db48D7f995D281D894e819C016E8c356757fE",
  "0xDe5bA75b008e93B04Ef1b516f93D1D466e6Dd392",
  "0x680A8a7E94d1EcA0cF651b174727ac5DF36E85c8",
  "0xA37d23D2192a4A61949e3E8339E6B5453FDB2Ae1",
  "0x360DE98FDC44357CED3D0CbD44387160A8f270D4",
  "0xB6B4417552145C197B060e1CD617e8f1B016c84a",
  "0x5bb11D23c94B13FbA6D22eAbb83bF3fd2458763E",
  "0x8AFdA0Df3D9601B32B731f829060BC0C1C95270D",
  "0x2090b0477E4852f929018c78ba9DD57e3B551d40",
  "0xF02ef3DcD71F1881f7d1F6Fc6D6f95c021d874b1",
  "0x414C51d5e837514Ac133cC9C8E14516ddBCc09c1",
  "0x7E744494f57511CA6733C83F262b3f674e95F28E",
  "0x158522242FD31385F2DdF6762c6d32b337274775",
  "0xdc09704Bf547B6639D5911504bC3111Aec8e97Fc",
  "0x4fcB41f71E31437419ce3Dee4e9c1092cA9cDE1F",
  "0x758C6c9731Ee68aD278f8C2F2f27b84aCB092649",
  "0x6c859c5f371DD107c423d4e065bFa09A8De421a9",
  "0x3f6919f676d5C7d2A65984dbdf5ae35254be1683",
];

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const pids = (
    await sdk.api.abi.multiCall({
      abi: vaultABI.pid,
      chain: "bsc",
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      block: chainBlocks["bsc"],
    })
  ).output.map((pid) => pid.output);

  const stakingTokens = (
    await sdk.api.abi.multiCall({
      abi: vaultABI.stakingToken,
      chain: "bsc",
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      block: chainBlocks["bsc"],
    })
  ).output.map((stakingToken) => stakingToken.output);

  const userInfos = (
    await sdk.api.abi.multiCall({
      abi: stakingABI.userInfo,
      chain: "bsc",
      calls: pids.map((pid, idx) => ({
        target: stakingContract,
        params: [pid, vaults[idx]],
      })),
      block: chainBlocks["bsc"],
    })
  ).output.map((stakingToken) => stakingToken.output.amount);

  const lpPositions = userInfos.map((amount, idx) => ({
    token: stakingTokens[idx],
    balance: amount,
  }));

  const transformAdress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAdress
  );

  // --- One side staking asset "CAKE" ---
  const infoCAKEVault = (
    await sdk.api.abi.call({
      abi: stakingABI.userInfo,
      chain: "bsc",
      target: stakingContract,
      params: [0, "0xa69AC402a8Afe80C4Db293baF231242242A131Af"],
      block: chainBlocks["bsc"],
    })
  ).output.amount;

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    infoCAKEVault
  );

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
