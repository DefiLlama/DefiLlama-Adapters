const { ArmadaIDL, WhirpoolIDL } = require("./idl");
const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { addUniV3LikePosition } = require("../helper/unwrapLPs");

async function tvl(api) {
  const anchorProvider = getProvider();
  const programId = new PublicKey(
    "ArmN3Av2boBg8pkkeCK9UuCN9zSUVc2UQg1qR2sKwm8d"
  );
  const armadaProgram = new Program(ArmadaIDL, programId, anchorProvider);

  const whirlpoolProgram = new Program(
    WhirpoolIDL,
    new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"),
    anchorProvider
  );

  // Load all the vaults in the program
  const vaults = await armadaProgram.account.clpVault.all();
  // Load all the TokenAccounts for the vaults
  const vaultTokenAccounts = [];
  const vaultMap = {};
  const whirlpoolKeys = [];
  const positionKeys = [];
  vaults.forEach((vault) => {
    vaultTokenAccounts.push(vault.account.tokenVaultA);
    vaultTokenAccounts.push(vault.account.tokenVaultB);
    whirlpoolKeys.push(vault.account.clp);
    vault.account.positions.forEach((position) => {
      if (position.positionKey.toString() !== PublicKey.default.toString()) {
        positionKeys.push(position.positionKey);
      }
    });
    vaultMap[vault.publicKey.toString()] = vault;
  });
  // Load all the Positions for the vaults
  const [positions, whirlpools] = await Promise.all([
    whirlpoolProgram.account.position.fetchMultiple(positionKeys),
    whirlpoolProgram.account.whirlpool.fetchMultiple(whirlpoolKeys),
  ]);
  const whirlpoolMap = whirlpools.reduce((agg, cur, index) => {
    agg[whirlpoolKeys[index].toString()] = cur;
    return agg;
  }, {});
  // Convert Positions to token amounts

  for (const position of positions) {
    const whirlpool = whirlpoolMap[position.whirlpool.toString()];
    const tickLower = position.tickLowerIndex
    const tickUpper =  position.tickUpperIndex
    const tick = whirlpool.tickCurrentIndex
    const liquidity = position.liquidity
    const token0 = whirlpool.tokenMintA.toString()
    const token1 = whirlpool.tokenMintB.toString()
    addUniV3LikePosition({ api, token0, token1, liquidity, tickLower, tickUpper, tick })
  }

  return sumTokens2({
    tokenAccounts: vaultTokenAccounts,
    balances: api.getBalances()
  });
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
