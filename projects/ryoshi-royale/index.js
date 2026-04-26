const BATTLE_REWARDS = "0x15b7d7402441DEA17637D5Edb373Ea773f135EDe";
const VAULTS = "0x200246E9c5E80496EaD817632d543B869A4537cC";
const RYOSHI_TOKEN = "0x055c517654d72A45B0d64Dc8733f8A38E27Fd49C";

async function tvl(api) {
  const croBalance = await api.getBalance({ target: BATTLE_REWARDS });
  api.add("crypto-com-chain", croBalance);

  await api.sumTokens({ owner: VAULTS, tokens: [RYOSHI_TOKEN] });
}

module.exports = {
  cronos: {
    tvl,
  },
};
