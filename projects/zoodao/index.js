const ADDRESSES = require('../helper/coreAssets.json')
const battleArenaAbi = require('./abis/battle-arena-abi.json');
const { stakings } = require('../helper/staking');

const ethers = require('ethers');

const VAULT_CONTRACT = '0x1C55649f73CDA2f72CEf3DD6C5CA3d49EFcF484C';
const BATTLE_ARENA_CONTRACT = '0x0ADeb5A930875606F325e114FD5147148e042828';
const FRAX_TOKEN = ADDRESSES.moonbeam.FRAX
const ZOODAO_TOKEN = "0x7cd3e6e1A69409deF0D78D17a492e8e143F40eC5"
const VE_ZOO_CONTRACT = "0x1bd77c71568f723d6906ea80fee45f1f52834c15"
const X_ZOO_CONTRACT = "0x1c535c24f911a8741018cf09f3030ab6e1b910cf"


/* ------------------------------------------------------ */
/*                      ARBITRUM ONE                      */
/* ------------------------------------------------------ */


const VE_ZOO_CONTRACT_ARBITRUM = "0xF7F963dC9c9f66c86Acd37255312FfbAC0d65b23"
const CAMELOT_LP_TOKEN_ARBITRUM = '0x2517cd42eE966862e8EcaAc9Abd1CcD272d897b6'
const BATTLE_ARENA_ARBITRUM = '0x19C98B4302e64d2De1cd14a7AD7d592F5dAE1319'

const FSGLP_ARBITRUM = '0x1aDDD80E6039594eE970E5872D247bf0414C8903'

const VAULT_CONTRACT_ARBITRUM = '0x9d284e037c20f029c8C56bbE4ff7C0F8de0FA4A9'
const LIQUIDITY_MAINING_ARBITRUM = '0x96EBfd5dfaBf5E94f55940FC1872f39031fb332c'

const LIQUDITY_MAININIG_ZOOLP_ARBITRUM = '0x2517cd42ee966862e8ecaac9abd1ccd272d897b6'


const stakingContracts = [
  BATTLE_ARENA_CONTRACT,
  VE_ZOO_CONTRACT,
  X_ZOO_CONTRACT
];

async function tvl(_, _1, _2, { api }) {
  const vaultStablecoinStaked = await api.call({ abi: 'erc20:balanceOf', target: VAULT_CONTRACT, params: [BATTLE_ARENA_CONTRACT] });
  console.log("🚀 ~ tvl ~ vaultStablecoinStaked:", vaultStablecoinStaked)

  // convert m.FRAX to FRAX
  const totalFRAX = await api.call({ abi: battleArenaAbi.sharesToTokens, target: BATTLE_ARENA_CONTRACT, params: [vaultStablecoinStaked] });
  api.add(FRAX_TOKEN, totalFRAX)
}

async function tvlArbitrum(_, _1, _2, { api }) {

  const vaultStablecoinStaked = await api.call({ abi: 'erc20:balanceOf', target: VAULT_CONTRACT_ARBITRUM, params: [BATTLE_ARENA_ARBITRUM] });
  let totalMGLP = await api.call({ abi: battleArenaAbi.sharesToTokens, target: BATTLE_ARENA_ARBITRUM, params: [vaultStablecoinStaked] });
  totalMGLP = ethers.toBigInt(totalMGLP)


  let veZooBalance = await api.call({ abi: 'erc20:balanceOf', target: LIQUDITY_MAININIG_ZOOLP_ARBITRUM, params: [VE_ZOO_CONTRACT_ARBITRUM] });
  veZooBalance = ethers.toBigInt(veZooBalance)

  let arenaLPBalance = await api.call({ abi: 'erc20:balanceOf', target: LIQUDITY_MAININIG_ZOOLP_ARBITRUM, params: [BATTLE_ARENA_ARBITRUM] });
  arenaLPBalance = ethers.toBigInt(arenaLPBalance)

  let miningLPBalance = await api.call({ abi: 'erc20:balanceOf', target: LIQUDITY_MAININIG_ZOOLP_ARBITRUM, params: [LIQUIDITY_MAINING_ARBITRUM] });
  miningLPBalance = ethers.toBigInt(miningLPBalance)

  // summ all bigInts
  const totalLPBalance = veZooBalance + arenaLPBalance + miningLPBalance


  api.addTokens([CAMELOT_LP_TOKEN_ARBITRUM, FSGLP_ARBITRUM], [totalLPBalance, totalMGLP])
}

module.exports = {
  methodology: "Counts the supplied value of FRAX and ZOO through ZooDAO's contracts",
  moonbeam: {
    tvl,
    staking: stakings(stakingContracts, ZOODAO_TOKEN)
  },
  arbitrum: {
    tvl: tvlArbitrum
  }
};
