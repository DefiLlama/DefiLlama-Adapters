const { get } = require('../helper/http')
const { staking } = require("../helper/staking.js");
const {stakings} = require("../helper/staking");
const vaultUrl = "https://mainnet.ocean.jellyfishsdk.com/v0/mainnet/address/df1q7zkdpw6hd5wzcxudx28k72vjvpefa4pyqls2grnahhyw4u8kf0zqu2cnz6/vaults";

const ONE_YEAR_LOCKING_MAINNET = '0xD88Bb8359D694c974C9726b6201479a123212333'
const TWO_YEARS_LOCKING_MAINNET = '0xc5B7aAc761aa3C3f34A3cEB1333f6431d811d638'

async function tvl(api) {
  const tvls = await api.multiCall({ abi: 'uint256:currentTvl', calls: [ONE_YEAR_LOCKING_MAINNET, TWO_YEARS_LOCKING_MAINNET] })
  const dusdTVL = tvls.reduce((agg, i) => agg + i / 1e18, 0)
  api.addCGToken('decentralized-usd', dusdTVL)
}

async function defichainTvl(api) {
  const { data: [vault] } = await get(vaultUrl)
  const vaultTvl = +vault.collateralValue - +vault.loanValue
  api.addCGToken('decentralized-usd', vaultTvl)
}

module.exports = {
  methodology: `We count the total value locked in DUSD from all current products (dusd staking is a vault in defichain L1, 
    1 year bond and 2 year bond are smart contracts on defimetachain L2. We also track staking and freezer of javsphers native token JAV). `,
  defichain_evm: {
    tvl,
    staking: stakings( ['0x4e15D4225623D07Adb43e9D546E57E1E6097e869', '0xF923f0828c56b27C8f57bc698c99543f63091E9A'],
      '0x66F3Cf265D2D146A0348F6fC67E3Da0835e0968E'),
    vesting: staking('0x7246ad1ac72715c5fd6c1FD7460A63afB8289104','0x66F3Cf265D2D146A0348F6fC67E3Da0835e0968E')
  }, defichain: {
    tvl: defichainTvl
  },
}
