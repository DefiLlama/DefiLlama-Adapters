const cakeVaultAbi = {
  getPricePerFullShare: "uint256:getPricePerFullShare",
  totalShares: "uint256:totalShares",
  calculateHarvestCakeRewards: "uint256:calculateHarvestCakeRewards",
  calculateTotalPendingCakeRewards: "uint256:calculateTotalPendingCakeRewards",
}
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
const sdk = require("@defillama/sdk")

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
  const woofVaultAddress = woofVaultContractAddres[chain];
    const [
      sharePrice,
      shares,
      estimatedCakeBountyReward,
      totalPendingCakeHarvest,
    ] = await Promise.all([
      sdk.api.abi.call({
        block, chain,
        target: woofVaultAddress,
        abi: cakeVaultAbi.getPricePerFullShare
      }),
      sdk.api.abi.call({
        block, chain,
        target: woofVaultAddress,
        abi: cakeVaultAbi.totalShares
      }),
      sdk.api.abi.call({
        block, chain,
        target: woofVaultAddress,
        abi: cakeVaultAbi.calculateHarvestCakeRewards
      }),
      sdk.api.abi.call({
        block, chain,
        target: woofVaultAddress,
        abi: cakeVaultAbi.calculateTotalPendingCakeRewards
      }),
    ]).then(response => response.map(a => a.output));
    
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
};

module.exports = fetchPublicVaultData;