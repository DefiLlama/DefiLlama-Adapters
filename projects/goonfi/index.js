const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const MARKETS = [
  {
    program: "goonERTdGsjnkZqWuVjs73BZ3Pb9qoCUdBUL17BnS5j",
    size: 1833,
    vaultOffset: 678,
  },
  {
    program: "goonuddtQRrWqqn5nFyczVKaie28f3kDkHWkHtURSLE",
    size: 2048,
    discriminator: "99nuWqpQZwP",
    vaultOffset: 144,
  },
];

async function tvl(api) {
  const connection = getConnection();
  const markets = await Promise.all(
    MARKETS.map(({ program, size, discriminator, vaultOffset }) =>
      connection.getProgramAccounts(new PublicKey(program), {
        filters: [
          { dataSize: size },
          ...(discriminator
            ? [{ memcmp: { offset: 0, bytes: discriminator } }]
            : []),
        ],
        dataSlice: { offset: vaultOffset, length: 64 },
      })
    )
  );

  const tokenAccounts = markets
    .flat()
    .flatMap(({ account }) => [0, 32].map((offset) =>
      new PublicKey(account.data.subarray(offset, offset + 32)).toBase58()
    ));

  return sumTokens2({ api, tokenAccounts });
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the SPL and Token-2022 balances held in every GoonFi V1 and V2 market's two token vaults. Markets and vault addresses are discovered directly from the GoonFi programs on-chain.",
  solana: { tvl },
};
