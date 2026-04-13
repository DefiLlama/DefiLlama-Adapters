const { getSolBalanceFromStakePool } = require('../helper/solana')
const { get } = require('../helper/http')

const RASOL_STAKE_POOL = 'ECRqn7gaNASuvTyC5xfCUjehWZCSowMXstZiM5DNweyB'

const EARN_VAULTS = [
  { asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', vault: '3maCuTJVPteZ2dFA8dADxz2EbpJHfoAG5txYhXDs6gNQ' }, // USDC
  { asset: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB', vault: '663azFYEnHDTLGf4CEk8KpNTje8XxZVLnQwo9LjbSejy' }, // USD1
  { asset: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', vault: '3kzb6rcDJxSdkWCwXXP9PULSqBy6rVDNWanzw5dBCYCj' }, // USDT
  { asset: 'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA', vault: '5mv1cURMSaPU3q3wFVoN4mKMWNFVvUtH3UZrG4Z2Mgfz' }, // USDS
  { asset: '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH', vault: '7VZ1XKK7Zns6UzRc1Wz54u6cypN7zaduasVXXr7NysxH' }, // USDG
]

async function staking(api) {
  await getSolBalanceFromStakePool(RASOL_STAKE_POOL, api)
}

async function tvl(api) {
  for (const { asset, vault } of EARN_VAULTS) {
    const { data } = await get(`https://api.voltr.xyz/vault/${vault}/share-price`)
    api.add(asset, data.totalValue)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Liquid staking TVL is the SOL backing raSOL. Earn TVL is the underlying stablecoins (USDC, USD1, USDT, USDS, USDG) held in Hubra Earn vaults backing the receipt tokens (raUSDC, raUSD1, raUSDT, raUSDS, raUSDG).',
  solana: {
    tvl,
    staking,
  },
}
