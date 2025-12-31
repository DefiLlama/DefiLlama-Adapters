const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require('@solana/web3.js');
const { getProvider, sumTokens2 } = require("../helper/solana");

async function numeraireTvlData() {
  const provider = getProvider()

  const programId = new PublicKey('NUMERUNsFCP3kuNmWZuXtm1AaQCPj9uw6Guv2Ekoi5P')
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, provider)
  // this filter is needed because the call fails, there are some bad pools that fail to decode
  const poolData = await program.account.stablePool.all([{ dataSize: program.account.stablePool._size }])
  const tokenAccounts = []
  const blacklistedTokens = []
  poolData.forEach(({ account: i }) => {
    blacklistedTokens.push(i.lpMint.toString())
    i.pairs.forEach(pair => {
      tokenAccounts.push(pair.xVault.toString())
    })
  })

  return { tokenAccounts: tokenAccounts.filter(i => i !== '11111111111111111111111111111111'), blacklistedTokens };
}

async function usdStarTvlData() {
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

  const balances = {};
  for (let i = 0; i < usdStarVaults.length; i++) {
    const vault = usdStarVaults[i];
    const tvl = vault.account.accounting.yieldingTvl.toNumber() / 10 ** 6 * 10 ** vault.account.config.yieldingMintDecimals;
    const key = "solana:" + vault.account.config.yieldingTokenMint.toString();

    if (!(key in balances)) {
      balances[key] = tvl;
    } else {
      balances[key] = balances[key] + tvl;
    }
  }

  return { balances };
}

async function tvl() {
  const { tokenAccounts, blacklistedTokens } = await numeraireTvlData();
  const { balances } = await usdStarTvlData();
  return sumTokens2({ balances, tokenAccounts, blacklistedTokens });
}

module.exports = {
  timetravel: false,
  solana: { tvl },
}