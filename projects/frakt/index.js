const { getAllProgramAccounts } = require('./helpers');

const tvl = async () => {
  const { timeBasedLiquidityPools, priceBasedLiquidityPools, loans } = await getAllProgramAccounts();

  const stakedInTimeBased = timeBasedLiquidityPools.reduce((sum, { amountOfStaked }) => sum + amountOfStaked, 0);
  const stakedInPriceBased = priceBasedLiquidityPools.reduce((sum, { amountOfStaked }) => sum + amountOfStaked , 0);

  const loansTvl = loans.reduce((sum, { loanStatus, originalPrice }) => {
    if (loanStatus === 'activated' ) { sum += originalPrice; }

    return sum;
  }, 0);

  const tvlInSol = (stakedInTimeBased + stakedInPriceBased + loansTvl) / 1e9;

  return { solana: tvlInSol };
};

module.exports = {
  timetravel: false,
  methodology: '',
  solana: {
    tvl,
  }
};
