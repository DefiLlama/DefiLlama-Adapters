const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");
const idl = require("./idl.json");

async function depositsTvl() {
  const provider = getProvider();
  const program = new Program(
    idl,
    "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg",
    provider,
  );
  const banks = await program.account.bank.all();
  return sumTokens2({ tokenAccounts: banks.map((i) => i.account.vault) });
}
async function borrowed(api) {
  const provider = getProvider();
  const program = new Program(
    idl,
    "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg",
    provider,
  );
  const banks = await program.account.bank.all();
  banks.forEach(({ account: i }) => {
    api.add(
      i.mint.toString(),
      i.indexedBorrows.val.mul(i.borrowIndex.val).toString() / 2 ** (48 * 2),
    );
  });
}

module.exports = {
  depositsTvl,
  borrowed,
};
