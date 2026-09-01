const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require('@solana/web3.js');
const { getProvider, } = require("../helper/solana");

async function tvl(api) {
  const provider = getProvider()

  const programId = new PublicKey('save8RQVPMWNTzU18t3GBvBkN9hT7jsGjiCQ28FpD9H')
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)

  const usdStarVaults = (await program.account.vaultGenState.all()).filter(
    (x) =>
      x.account.config.bank.equals(
        new PublicKey("sM6P4mh53CnG4faN4Fo3seY7wMSAiHdy8o6gKjwQF7A") // USD* bank
      )
  );

  for (let i = 0; i < usdStarVaults.length; i++) {
    const vault = usdStarVaults[i];
    const tvl = vault.account.accounting.yieldingTvl.toNumber() / 10 ** 6 * 10 ** vault.account.config.yieldingMintDecimals;
    const token = vault.account.config.yieldingTokenMint.toString()
    api.add(token, tvl);
  }

}

module.exports = {
  timetravel: false,
  solana: { tvl },
}