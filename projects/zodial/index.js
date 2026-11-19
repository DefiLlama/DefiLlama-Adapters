const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2 } = require("../helper/solana");

const idl = require("./idl");

const ZODIAL_PROGRAM_ID = "zod11Jzp72T6qBbGVJfR38y1pGY3dBK8nSuouD4mMkZ";
const ZODIAL_MAIN_GROUP = "GVmJcvayCLQcsNB95LM37TmiNwWP5USkSnWnZ5w1Uw1v";
const BANK_GROUP_OFFSET = 41;
const VALID_ASSET_TAGS = [0, 1, 2, 3];
const I80F48_SCALE = 2n ** 48n;
const I80F48_PRODUCT_SCALE = I80F48_SCALE ** 2n;

let zodialBanksPromise;

function getI80F48Value(value) {
  return BigInt(value.value.toString());
}

function getLiabilityAmount(bank) {
  const shares = getI80F48Value(bank.totalLiabilityShares);
  const shareValue = getI80F48Value(bank.liabilityShareValue);

  return (shares * shareValue) / I80F48_PRODUCT_SCALE;
}

async function getZodialBanks() {
  if (!zodialBanksPromise) {
    zodialBanksPromise = fetchZodialBanks().catch((error) => {
      zodialBanksPromise = undefined;
      throw error;
    });
  }

  return zodialBanksPromise;
}

async function fetchZodialBanks() {
  const provider = getProvider();
  const program = new Program(idl, ZODIAL_PROGRAM_ID, provider);
  const banks = await program.account.bank.all([
    {
      memcmp: {
        offset: BANK_GROUP_OFFSET,
        bytes: ZODIAL_MAIN_GROUP,
      },
    },
  ]);

  return banks.filter(({ account: bank }) => VALID_ASSET_TAGS.includes(bank.config?.assetTag));
}

async function tvl(api) {
  const zodialBanks = await getZodialBanks();

  return sumTokens2({ api, tokenAccounts: zodialBanks.map(({ account: bank }) => bank.liquidityVault.toString()) });
}

async function borrowed(api) {
  const zodialBanks = await getZodialBanks();

  for (const { account: bank } of zodialBanks) {
    const amount = getLiabilityAmount(bank);
    if (amount > 0n) {
      api.add(bank.mint.toString(), amount);
    }
  }

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed },
  methodology: "TVL is calculated as token balances held in liquidity vaults for Zodial's mainnet group. Borrowed is calculated from each bank's total liability shares multiplied by its liability share value.",
};
