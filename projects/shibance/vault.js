const cakeVaultAbi = require("./abi.json");
const { getWeb3, multicall } = require("./api");
const BigNumber = require("bignumber.js");
const {
  getBalanceNumber,
  getFullDisplayBalance,
  getDecimalAmount,
} = require("./format");

const woofVaultContractAddres = {
  kcc: "0x5cE1e2F6c99aFcfbB6E640354837C263ec3a5664",
  bsc: "0x09fE45A62502E7a0b226a99f18043F3eC32F78E8",
};

const convertSharesToWoof = (
  shares,
  cakePerFullShare,
  decimals = 18,
  decimalsToRound = 3
) => {
  const sharePriceNumber = getBalanceNumber(cakePerFullShare, decimals);
  const amountInCake = new BigNumber(shares.multipliedBy(sharePriceNumber));
  const cakeAsNumberBalance = getBalanceNumber(amountInCake, decimals);
  const cakeAsBigNumber = getDecimalAmount(
    new BigNumber(cakeAsNumberBalance),
    decimals
  );
  const cakeAsDisplayBalance = getFullDisplayBalance(
    amountInCake,
    decimals,
    decimalsToRound
  );
  return { cakeAsNumberBalance, cakeAsBigNumber, cakeAsDisplayBalance };
};

const fetchPublicVaultData = async (chain, block) => {
  try {
    const web3 = getWeb3(chain);
    const woofVaultAddress = woofVaultContractAddres[chain];
    const woofVaultContract = new web3.eth.Contract(
      cakeVaultAbi,
      woofVaultAddress
    );

    const [
      sharePrice,
      shares,
      estimatedCakeBountyReward,
      totalPendingCakeHarvest,
    ] = await Promise.all([
      woofVaultContract.methods.getPricePerFullShare().call({}, block),
      woofVaultContract.methods.totalShares().call({}, block),
      woofVaultContract.methods.calculateHarvestCakeRewards().call({}, block),
      woofVaultContract.methods
        .calculateTotalPendingCakeRewards()
        .call({}, block),
    ]);
    const totalSharesAsBigNumber = new BigNumber(shares);
    const sharePriceAsBigNumber = new BigNumber(sharePrice);
    const totalCakeInVaultEstimate = convertSharesToWoof(
      totalSharesAsBigNumber,
      sharePriceAsBigNumber
    );
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalCakeInVault: totalCakeInVaultEstimate.cakeAsBigNumber.toJSON(),
      estimatedCakeBountyReward: new BigNumber(
        estimatedCakeBountyReward
      ).toJSON(),
      totalPendingCakeHarvest: new BigNumber(totalPendingCakeHarvest).toJSON(),
    };
  } catch (error) {
    console.log(error);
    return {
      totalShares: null,
      pricePerFullShare: null,
      totalCakeInVault: null,
      estimatedCakeBountyReward: null,
      totalPendingCakeHarvest: null,
    };
  }
};

module.exports = fetchPublicVaultData;