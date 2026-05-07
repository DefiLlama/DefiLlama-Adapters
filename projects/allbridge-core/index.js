const { addUSDCBalance } = require("../helper/chain/stellar");
const solana = require("../helper/solana");
const sui = require("../helper/chain/sui");

const data = require("./contracts");

const solanaTvl = async (api) => {
  const tokens = data['solana'].tokens;
  return solana.sumTokens2({ tokensAndOwners: tokens.map(i => [i.tokenAddress, i.poolAddress])});
}

const suiTvl = async (api) => {
  const { bridgeAddress, bridgeId, tokens } = data['sui'];
  const initialSharedVersion = await sui.getInitialSharedVersion(bridgeId);

  for (const { tokenAddress } of tokens) {
    const txBytes = sui.buildProgrammableMoveCallBytes({
      packageId: bridgeAddress,
      module: 'bridge_interface',
      functionName: 'pool_balance',
      typeArguments: [tokenAddress],
      sharedObjects: [{ objectId: bridgeId, initialSharedVersion, mutable: false }],
    });
    const inspection = await sui.devInspectTransactionBlock(txBytes);
    const balanceBytes = inspection?.results?.[0]?.returnValues?.[0]?.[0];
    if (!Array.isArray(balanceBytes) || balanceBytes.length !== 8) {
      throw new Error(`Unexpected pool_balance return for ${tokenAddress}: ${JSON.stringify(inspection?.results)}`);
    }
    api.add(tokenAddress, sui.fromU64(balanceBytes).toString());
  }
}

function getTVLFunction(chain) {
  if (chain === 'solana') return solanaTvl;
  if (chain === 'sui') return suiTvl;

  return async function evmTvl(api) {
    const tokensData = data[chain].tokens;
    const tokensAndOwners = tokensData.map(t => [t.tokenAddress, t.poolAddress]);
    return api.sumTokens({ tokensAndOwners, })
  };
}

module.exports = {
  methodology: "All tokens locked in Allbridge Core pool contracts.",
  timetravel: false,
  stellar: { tvl: stellarTvl },
}

Object.keys(data).forEach(chain => {
  module.exports[chain] = {
    tvl: getTVLFunction(chain),
  }
})


async function stellarTvl(api) {
  await addUSDCBalance(api, 'CAOTMWRKNMV5GWSVOMWCTCM5ZZFEQFUSWNLCZXA2KAXD4YG5A4DIPNFT')
}
