

const {totalCollateralAmountAbi, totalMintedAmountAbi, oraclePriceAbi, collateralAssetAbi} =require('./abi');

const ocUsd = '0x88F7566455825B0d1b3DeEE3b84307eDAf8abaAc'
const poolAddresses = [
    '0xD50766f79Ecef0BA96E1d7DD7ccB56E1b2Ba1120', // eth,
    '0x2F453e781E3A474290fad60a22fEa6f155B69fBD', // usdc
    '0x836280846adc84f28918Cec30A7dCe791D17b72C', // wsteth
]


async function tvl(_, _1, _2, { api }) {
    const collateralAmounts = await api.multiCall({
      calls: poolAddresses,
      abi: totalCollateralAmountAbi,
    });
    const collateralAddresses = await api.multiCall({
      calls: poolAddresses,
      abi: collateralAssetAbi,
    });
    api.addTokens(collateralAddresses, collateralAmounts);
  }
module.exports = {
    manta: {
        tvl: tvl
    }
  };
  