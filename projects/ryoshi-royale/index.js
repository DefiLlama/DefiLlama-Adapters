const BATTLE_REWARDS = "0x15b7d7402441DEA17637D5Edb373Ea773f135EDe";
const VAULTS = "0x200246E9c5E80496EaD817632d543B869A4537cC";
const RYOSHI_TOKEN = "0x055c517654d72A45B0d64Dc8733f8A38E27Fd49C";
const nullAddress = "0x0000000000000000000000000000000000000000";

async function tvl(api) {
  return api.sumTokens({ owner: BATTLE_REWARDS, tokens: [nullAddress] });
}

async function staking(api) {
  return api.sumTokens({ owner: VAULTS, tokens: [RYOSHI_TOKEN] });
}

module.exports = {
  methodology: "TVL is calculated as native CRO held in the Battle Rewards contract. RYOSHI tokens locked in Vaults are tracked separately as staking.",
  cronos: {
    tvl,
    staking,
  },
};
