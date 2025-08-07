const { getMultipleAccounts, getProvider } = require('../../helper/solana');
const { Program, BN } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { DRIFT_VAULTS } = require("../constants");

function getTokenInfo(marketIndex) {
  switch (marketIndex) {
    case 0: return TOKEN_INFO.USDC
    case 1: return TOKEN_INFO.SOL
    case 6: return TOKEN_INFO.jitoSOL
    case 9: return TOKEN_INFO.JTO
    case 10: return TOKEN_INFO.WIF
    case 15: return TOKEN_INFO.DRIFT
    case 16: return TOKEN_INFO.INF
    case 17: return TOKEN_INFO.dSOL
    case 19: return TOKEN_INFO.JLP
    case 27: return TOKEN_INFO.cbBTC
    case 28: return TOKEN_INFO.USDS
    case 32: return TOKEN_INFO.BONK
    default: return undefined
  }
}

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

