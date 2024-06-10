const ADDRESSES = require('../helper/coreAssets.json')
const battleArenaAbi = require('./abis/battle-arena-abi.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const VAULT_CONTRACT = '0x1C55649f73CDA2f72CEf3DD6C5CA3d49EFcF484C';
const BATTLE_ARENA_CONTRACT = '0x0ADeb5A930875606F325e114FD5147148e042828';
const FRAX_TOKEN = ADDRESSES.moonbeam.FRAX
const ZOODAO_TOKEN = "0x7cd3e6e1A69409deF0D78D17a492e8e143F40eC5"
const VE_ZOO_CONTRACT = "0x1bd77c71568f723d6906ea80fee45f1f52834c15"
const X_ZOO_CONTRACT = "0x1c535c24f911a8741018cf09f3030ab6e1b910cf"


const VE_ZOO_CONTRACT_ARBITRUM = "0xF7F963dC9c9f66c86Acd37255312FfbAC0d65b23"
const CAMELOT_LP_TOKEN_ARBITRUM = '0x2517cd42eE966862e8EcaAc9Abd1CcD272d897b6'
const BATTLE_ARENA_ARBITRUM = '0x19C98B4302e64d2De1cd14a7AD7d592F5dAE1319'

const FSGLP_ARBITRUM = ADDRESSES.arbitrum.fsGLP

const VAULT_CONTRACT_ARBITRUM = '0x9d284e037c20f029c8C56bbE4ff7C0F8de0FA4A9'
const LIQUIDITY_MINING_ARBITRUM = '0x96EBfd5dfaBf5E94f55940FC1872f39031fb332c'

const stakingContracts = [
  BATTLE_ARENA_CONTRACT,
  VE_ZOO_CONTRACT,
  X_ZOO_CONTRACT
]

async function tvl(api) {
  const vaultStablecoinStaked = await api.call({ abi: 'erc20:balanceOf', target: VAULT_CONTRACT, params: [BATTLE_ARENA_CONTRACT] });
  // convert m.FRAX to FRAX
  const totalFRAX = await api.call({ abi: battleArenaAbi.sharesToTokens, target: BATTLE_ARENA_CONTRACT, params: [vaultStablecoinStaked] });
  api.add(FRAX_TOKEN, totalFRAX)
}

async function tvlArbitrum(api) {
  const vaultStablecoinStaked = await api.call({ abi: 'erc20:balanceOf', target: VAULT_CONTRACT_ARBITRUM, params: [BATTLE_ARENA_ARBITRUM] });
  let totalMGLP = await api.call({ abi: battleArenaAbi.sharesToTokens, target: BATTLE_ARENA_ARBITRUM, params: [vaultStablecoinStaked] });
  api.addTokens([FSGLP_ARBITRUM], [totalMGLP])
}

module.exports = {
  methodology: "TVL: Counts the supplied value of mGLP and staked ZOO-ETH LP.",
  moonbeam: {
    tvl,
    staking: sumTokensExport({ owners: stakingContracts, tokens: [ZOODAO_TOKEN] }),
  },
  arbitrum: {
    tvl: tvlArbitrum,
    pool2: sumTokensExport({ owners: [LIQUIDITY_MINING_ARBITRUM, BATTLE_ARENA_ARBITRUM, VE_ZOO_CONTRACT_ARBITRUM], tokens: [ CAMELOT_LP_TOKEN_ARBITRUM] }),
  }
};
