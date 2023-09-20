const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const programId = 'JPPooLEqRo3NCSx82EdE2VZY5vUaSsgskpZPBHNGVLZ';

async function tvl() {
  const provider = getProvider()
  const program = new Program(idl, programId, provider)
  const accounts = await program.account.marginPool.all()
  return sumTokens2({ tokenAccounts: accounts.map(i => i.account.vault.toString()), })
}

module.exports = {
  methodology: 'Add all the SOL in the pools, NFT value is not included in tvl',
  timetravel: false,
  solana: {
    tvl,
  },
};

const idl = {"version":"1.0.0","name":"jet_margin_pool","instructions":[],"accounts":[{"name":"MarginPool","type":{"kind":"struct","fields":[{"name":"version","type":"u8"},{"name":"poolBump","type":{"array":["u8",1]}},{"name":"vault","type":"publicKey"},{"name":"feeDestination","type":"publicKey"},{"name":"depositNoteMint","type":"publicKey"},{"name":"loanNoteMint","type":"publicKey"},{"name":"tokenMint","type":"publicKey"},{"name":"tokenPriceOracle","type":"publicKey"},{"name":"address","type":"publicKey"},{"name":"config","type":{"defined":"MarginPoolConfig"}},{"name":"borrowedTokens","type":{"array":["u8",24]}},{"name":"uncollectedFees","type":{"array":["u8",24]}},{"name":"depositTokens","type":"u64"},{"name":"depositNotes","type":"u64"},{"name":"loanNotes","type":"u64"},{"name":"accruedUntil","type":"i64"}]}}],"types":[{"name":"MarginPoolConfig","type":{"kind":"struct","fields":[{"name":"flags","type":"u64"},{"name":"utilizationRate1","type":"u16"},{"name":"utilizationRate2","type":"u16"},{"name":"borrowRate0","type":"u16"},{"name":"borrowRate1","type":"u16"},{"name":"borrowRate2","type":"u16"},{"name":"borrowRate3","type":"u16"},{"name":"managementFeeRate","type":"u16"},{"name":"reserved","type":"u64"}]}}],"events":[],"errors":[]}