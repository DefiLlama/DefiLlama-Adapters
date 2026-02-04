const { PublicKey } = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const { sumTokens2, } = require("./helper/solana");
const DRIFT_PROGRAM_ID = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH')
const { getConfig } = require('./helper/cache')

module.exports = {
  timetravel: false,
  methodology: "Calculate sum across all program token accounts",
  solana: {
    tvl,
    staking: () => sumTokens2({ tokenAccounts: ['9EzLvGf4m7drJCoEdaLoC4D8uYux6tuM1EdtGV4YCEcS']})
  },
};

async function tvl() {

  const legacyVaults = [
    '6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S', // legacy usdc vault
    'Bzjkrm1bFwVXUaV9HTnwxFrPtNso7dnwPQamhqSxtuhZ', // legacy usdc insurance fund
  ];
  const getSpotMarketVaultPublicKey = marketIndex => getVaultPublicKey('spot_market_vault', marketIndex)
  const getInsuranceFundVaultPublicKey = marketIndex => getVaultPublicKey('insurance_fund_vault', marketIndex)
  let configFile = await getConfig('drift-config', 'https://raw.githubusercontent.com/drift-labs/protocol-v2/master/sdk/src/constants/spotMarkets.ts')
  const marketIndices = [];
  configFile = configFile.slice(configFile.indexOf('MainnetSpotMarkets:'))

  const regex = /marketIndex:\s*(\d+),/g
  let match;
  while ((match = regex.exec(configFile))) {
    marketIndices.push(parseInt(match[1]));
  }

  const vaults = [
    ...legacyVaults,
    ...marketIndices.map(getSpotMarketVaultPublicKey),
    ...marketIndices.map(getInsuranceFundVaultPublicKey),
  ].filter(i => i !== '9EzLvGf4m7drJCoEdaLoC4D8uYux6tuM1EdtGV4YCEcS')  // drift staking account, handled in staking module

  return sumTokens2({ tokenAccounts: vaults })
}

function getVaultPublicKey(seed, marketIndex) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(seed)),
      new anchor.BN(marketIndex).toArrayLike(Buffer, 'le', 2),
    ], DRIFT_PROGRAM_ID)[0].toBase58()
}

