const ADDRESSES = require('../helper/coreAssets.json')
const battleArenaAbi = require('./abis/battle-arena-abi.json');
const { stakings } = require('../helper/staking');

const VAULT_CONTRACT = '0x1C55649f73CDA2f72CEf3DD6C5CA3d49EFcF484C';
const BATTLE_ARENA_CONTRACT = '0x0ADeb5A930875606F325e114FD5147148e042828';
const FRAX_TOKEN = ADDRESSES.moonbeam.FRAX
const ZOODAO_TOKEN = "0x7cd3e6e1A69409deF0D78D17a492e8e143F40eC5"
const VE_ZOO_CONTRACT = "0x1bd77c71568f723d6906ea80fee45f1f52834c15"
const X_ZOO_CONTRACT = "0x1c535c24f911a8741018cf09f3030ab6e1b910cf"

const stakingContracts = [
  BATTLE_ARENA_CONTRACT,
  VE_ZOO_CONTRACT,
  X_ZOO_CONTRACT
];

async function tvl(_, _1, _2, { api }) {
  const vaultStablecoinStaked = await api.call({ abi: 'erc20:balanceOf', target: VAULT_CONTRACT, params: [BATTLE_ARENA_CONTRACT] });

  // convert m.FRAX to FRAX
  const totalFRAX = await api.call({ abi: battleArenaAbi.sharesToTokens, target: BATTLE_ARENA_CONTRACT, params: [vaultStablecoinStaked] });
  api.add(FRAX_TOKEN, totalFRAX)
}

module.exports = {
  methodology: "Counts the supplied value of FRAX and ZOO through ZooDAO's contracts",
  moonbeam: {
    tvl,
    staking: stakings(stakingContracts, ZOODAO_TOKEN)
  },
};
