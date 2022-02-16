const ethers = require("ethers");
const abi = require("./abi.json");

const getTvl = async () => {
  const elfiAddress = "0x4da34f8264cb33a5c9f17081b9ef5ff6091116f4";
  const elfyV2StakingPoolAddress = "0xCD668B44C7Cf3B63722D5cE5F655De68dD8f2750";
  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    {
      name: "ethereum",
      chainId: 1,
    }
  );
  const elStakingPoolContract = new ethers.Contract(
    elfyV2StakingPoolAddress,
    abi,
    rpcProvider
  );

  const elfiBalance = await elStakingPoolContract.balanceOf(elfiAddress);
  console.log(`elfiBalance: ${elfiBalance}`);
};

module.exports = {
  tvl: 1,
  getTvl,
};
