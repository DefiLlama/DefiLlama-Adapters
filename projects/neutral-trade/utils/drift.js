const { getMultipleAccounts, getProvider } = require('../../helper/solana');
const { Program, BN } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { DRIFT_VAULTS } = require("../constants");


function getProgram() {
  const idl = require("../idl/drift_idl.json");
  const programId = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH');
  const provider = getProvider();
  return new Program(idl, programId, provider);
}

async function getTvl(api) {
  const vaultAddresses = DRIFT_VAULTS.map(vault => vault.address);
  const accounts = await getMultipleAccounts(vaultAddresses);
  const program = getProgram();

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    if (!account) continue;
    const userData = program.coder.accounts.decode("User", account.data);
    for (let j = 0; j < userData.spotPositions.length; j++) {
      const spotPosition = userData.spotPositions[j];
      if (!new BN(spotPosition.scaledBalance).isZero()) {
        const marketIndex = spotPosition.marketIndex;
        const balanceType = Object.keys(spotPosition.balanceType ?? {})?.[0];
        const scaledBalance = new BN(spotPosition.scaledBalance);
        const token = getTokenInfo(marketIndex);
        if (!token) continue;
        const balance = scaledBalance
          .mul(new BN(balanceType === 'deposit' ? 1 : -1))
          .div(new BN(10).pow(new BN(token.decimals - 9)));
        api.add(token.mint, balance.toString());
      }
    }
  }
}

module.exports = {
  getTvl
};
