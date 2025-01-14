const { PublicKey } = require('@solana/web3.js');
const { Program } = require("@project-serum/anchor");
const { getConnection, getProvider, getTokenSupplies } = require('../helper/solana')

async function tvl(api) {

  const connection = getConnection()
  const programId = 'CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s'
  const testVaultExclusion = '2AV35oWyAuSN5wmuy26VD5JirjVpXkfkv5ZMCQ2LtpuV' // our test vault should not be included in TVL 

  // Use this method to track TVL via the token...
  // const CRT_MINT = 'CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s';
  // await getTokenSupplies(CRT_MINT, {api})

  // Use this method to track TVL via onchain state of each Vault by adding the balance at each strategy.
  const programAccounts = await connection.getProgramAccounts(new PublicKey(programId), {
    filters: [{
      memcmp: {
        offset: 8,
        bytes: 'CarrotLYPhQzYL4fEsTUvEzw5QDaMGSZUENHSkh7qzQa' // carrot keeper
      },
    },]
  });

  const provider = getProvider();
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)

  programAccounts.forEach(({ account, pubkey }, i) => {
    if(pubkey.toBase58() !== testVaultExclusion) {
      const { assets, strategies } = program.coder.accounts.decode(
        "Vault",
        account.data
      );
      const assetMap = {}
      assets.forEach(({assetId, mint }) => assetMap[assetId] = mint.toString())

      strategies.forEach(i => {
        api.add(assetMap[i.assetId], i.balance.toString())
      })
    }
  })
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology: 'TVL calculated by calling the onchain state of the CRT Vault accounts, and tallying the balance of each strategy.',
  solana: { tvl },
}
