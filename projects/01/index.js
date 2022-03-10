const { getTokenBalance, getTokenSupply } = require('./helper/solana')

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
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "3er2PEWxhpuRkbVwE3ks2nynr5EtcSjCs5fdDJiKQocp"),
        getTokenBalance("So11111111111111111111111111111111111111112", "AD4uA59En43SMyDX4arCvSiZ7hJhBy4tUxk5A4fgcwVz"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "BwN2eXEpAfS9kZg7CaXkdNQF2Ffib3H2wv3vT6J7VXtj"),
        getTokenBalance("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", "mw2SkQ7mKef8sJueHvj6dMfRQ4Y9Noibm2Px5Uk9snA"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "EMQdDKrQaFMJSWLWwUxBaqREKy1CWzUy3aupL9ffDQYi"),
        getTokenBalance("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "JCvAu7Mg35suUz3NVE42DivxYbbN9M6VBt4wg5pUaFsw"),
        getTokenBalance("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i", "BoMMbP9jQCbgH3NdYwZYCSFK87UPG8NHxmasuYxEiQHx"),
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
