const sdk = require('@defillama/sdk');
const battleArenaAbi = require('./abis/battle-arena-abi.json')

const VAULT_CONTRACT = '0x1C55649f73CDA2f72CEf3DD6C5CA3d49EFcF484C';
const BATTLE_ARENA_CONTRACT = '0x0ADeb5A930875606F325e114FD5147148e042828';
const FRAX_TOKEN = "0x322e86852e492a7ee17f28a78c663da38fb33bfb"
const ZOODAO_TOKEN = "0x7cd3e6e1A69409deF0D78D17a492e8e143F40eC5"

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const vaultStablecoinStaked = await api.call({
    abi: 'erc20:balanceOf',
    target: VAULT_CONTRACT,
    params: [BATTLE_ARENA_CONTRACT]
  });

  const totalFRAX = await api.call({
    abi: battleArenaAbi.sharesToTokens,
    target: BATTLE_ARENA_CONTRACT,
    params: [vaultStablecoinStaked]
  });

  // TOTAL FRAX BALANCE
  await sdk.util.sumSingleBalance(balances, FRAX_TOKEN, totalFRAX, api.chain)

  const totalZooStaked = await api.call({
    abi: 'erc20:balanceOf',
    target: ZOODAO_TOKEN,
    params: [BATTLE_ARENA_CONTRACT]
  });

  // TOTAL ZOODAO BALANCE
  await sdk.util.sumSingleBalance(balances, ZOODAO_TOKEN, totalZooStaked, api.chain)

  return balances;
}

module.exports = {
  methodology: "Counts the supplied value of FRAX and ZOO through ZooDAO's contracts",
  moonbeam: {
    tvl
  },
};
