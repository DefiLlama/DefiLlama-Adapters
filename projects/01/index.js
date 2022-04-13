const { getTokenBalance, getTokenSupply } = require('../helper/solana')

async function tvl() {
    const [
      usdc,
      wsol,
      usdt,
      ether,
      wbtc,
      msol,
      ust
    ] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
        getTokenBalance("So11111111111111111111111111111111111111112", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
        getTokenBalance("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
        getTokenBalance("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
        getTokenBalance("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i", "HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ"),
    ])
    return {
        'usd-coin': usdc,
        'solana':wsol,
        'msol': msol,
        'tether': usdt,
        'terrausd': ust,
        'ethereum': ether,
        'bitcoin': wbtc,
    }
}
module.exports = {
    timetravel: false,
    solana: {
        tvl,
    },
    methodology: `To obtain the tvl we're getting the vault accounts information where user deposited collateral is stored.`,
}
