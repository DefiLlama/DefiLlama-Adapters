const TARAXA_STAKING_CONTRACT = "0x00000000000000000000000000000000000000fe";
const TARAXA_ECOSYSTEM_FUND_ADDRESS =
  "0x723304d1357a2334fcf902aa3d232f5139080a1b";
const TARAXA_FOUNDATION_ADDRESS = "0x723304d1357a2334fcf902aa3d232f5139080a1b";

async function staking(api) {
  const balance = await api.provider.getBalance(
    TARAXA_STAKING_CONTRACT,
    api.block
  );
  api.addGasToken(Number(balance) / 10 ** 18);
}

async function tvl(api) {
  const balanceEcosystem = await api.provider.getBalance(
    TARAXA_ECOSYSTEM_FUND_ADDRESS,
    api.block
  );

  const balanceFoundation = await api.provider.getBalance(
    TARAXA_FOUNDATION_ADDRESS,
    api.block
  );
  
  api.addGasToken((Number(balanceEcosystem) + Number(balanceFoundation))  / 10 ** 18);
}

module.exports = {
  tara: {
    tvl,
    staking,
  },
};
