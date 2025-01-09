const { Program, } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require('./helper/solana')
const ADDRESSES = require('./helper/coreAssets.json')

async function tvl() {
  const tokensAndOwners = [

    // PAI-3Pool
    [ADDRESSES.solana.USDC, '2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR'],
    [ADDRESSES.solana.USDT, '2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR'],
    ['Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS', '2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR'],

    // UST-3Pool
    ['CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm', 'FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D'],
    [ADDRESSES.solana.USDC, 'FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D'],
    [ADDRESSES.solana.USDT, 'FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D'],

    // pSOL-2Pool
    [ADDRESSES.solana.pSOL, '8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3'],
    [ADDRESSES.solana.SOL, '8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3'],

    // wUSD-4Pool
    [ADDRESSES.solana.DAI, '3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'],
    ['A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM', '3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'],
    [ADDRESSES.solana.USDC, '3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'],
    ['Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1', '3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'],

    // stSOL-2Pool
    [ADDRESSES.solana.SOL, 'pG6noYMPVR9ykNgD4XSNa6paKKGGwciU2LckEQPDoSW'],
    ['7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', 'pG6noYMPVR9ykNgD4XSNa6paKKGGwciU2LckEQPDoSW'],

    // mSOL-2Pool
    [ADDRESSES.solana.SOL, 'GcJckEnDiWjpjQ8sqDKuNZjJUKAFZSiuQZ9WmuQpC92a'],
    ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'GcJckEnDiWjpjQ8sqDKuNZjJUKAFZSiuQZ9WmuQpC92a'],

    // wbBUSD-4Pool
    [ADDRESSES.solana.USDC, 'D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'],
    [ADDRESSES.solana.USDTbs, 'D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'],
    [ADDRESSES.solana.USDCbs, 'D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'],
    [ADDRESSES.solana.BUSDbs, 'D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'],

    // UXD-3Pool
    ['7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT', '62JkSDhZLgwLu8in73E46CPTzEf8hMGMxSNUw5r5mMA8'],
    [ADDRESSES.solana.USDC, '62JkSDhZLgwLu8in73E46CPTzEf8hMGMxSNUw5r5mMA8'],
    [ADDRESSES.solana.USDT, '62JkSDhZLgwLu8in73E46CPTzEf8hMGMxSNUw5r5mMA8'],

    // USTv2-3Pool
    ['9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i', '44K7k9pjjKB6LcWZ1sJ7TvksR3sb4AXpBxwzF1pcEJ5n'],
    [ADDRESSES.solana.USDC, '44K7k9pjjKB6LcWZ1sJ7TvksR3sb4AXpBxwzF1pcEJ5n'],
    [ADDRESSES.solana.USDT, '44K7k9pjjKB6LcWZ1sJ7TvksR3sb4AXpBxwzF1pcEJ5n'],

    // USDH-3Pool
    ['USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX', 'F1TVmk1LAaVDGDfEFJWfNLCh9wikZxv33e54ZPeRQzEh'],
    [ADDRESSES.solana.USDC, 'F1TVmk1LAaVDGDfEFJWfNLCh9wikZxv33e54ZPeRQzEh'],
    [ADDRESSES.solana.USDT, 'F1TVmk1LAaVDGDfEFJWfNLCh9wikZxv33e54ZPeRQzEh'],

    // aUSDC-4Pool
    [ADDRESSES.solana.aeUSDC, '5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'],
    [ADDRESSES.solana.aaUSDC, '5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'],
    [ADDRESSES.solana.apUSDC, '5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'],
    [ADDRESSES.solana.USDC, '5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'],

    // acUSD-3Pool
    ['A96PoNcxa9LMxcF9HhKAfA1p3M1dGbubPMWf19gHAkgJ', 'FhqkDgkhrDY75Tq6rx1ezp6R36AjHsXVvRYJkiyhFoZU'],
    ['EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e', 'FhqkDgkhrDY75Tq6rx1ezp6R36AjHsXVvRYJkiyhFoZU'],
    [ADDRESSES.solana.USDC, 'FhqkDgkhrDY75Tq6rx1ezp6R36AjHsXVvRYJkiyhFoZU'],

    // fUSD-3Pool
    ['B7mXkkZgn7abwz1A3HnKkb18Y6y18WcbeSkh1DuLMkee', 'EdJbEpfASQB99Y2BMUEb5rtgVUcJ2bBUqe59f4JJ9o6t'],
    [ADDRESSES.solana.USDC, 'EdJbEpfASQB99Y2BMUEb5rtgVUcJ2bBUqe59f4JJ9o6t'],
    [ADDRESSES.solana.USDT, 'EdJbEpfASQB99Y2BMUEb5rtgVUcJ2bBUqe59f4JJ9o6t'],

    // USN-4Pool
    ['EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e', 'CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'],
    [ADDRESSES.solana.afUSDC, 'CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'],
    ['PUhuAtMHsKavMTwZsLaDeKy2jb7ciETHJP7rhbKLJGY', 'CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'],
    [ADDRESSES.solana.USDC, 'CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'],

    // abBUSD-4Pool
    [ADDRESSES.solana.abUSDC, '89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'],
    [ADDRESSES.solana.USDC, '89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'],
    [ADDRESSES.solana.abUSDT, '89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'],
    ['6nuaX3ogrr2CaoAPjtaKHAoBNWok32BMcRozuf32s2QF', '89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'],

    // aaUSDT-4Pool
    ['DNhZkUaxHXYvpxZ7LNnHtss8sQgdAfd1ZYS1fB7LKWUZ', 'A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'],
    [ADDRESSES.solana.aeUSDT, 'A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'],
    [ADDRESSES.solana.aaUSDT, 'A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'],
    [ADDRESSES.solana.USDT, 'A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'],

  ]

  const provider = getProvider()
  const programId = 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const pools = await program.account.pool.all()
  pools.forEach(({ account: i }) => {
    tokensAndOwners.push([i.tokenAMint, i.aVault])
    tokensAndOwners.push([i.tokenBMint, i.bVault])
  })
  const balances = await sumTokens2({ tokensAndOwners })
  delete balances['solana:AwRErBEFGTnohzfLeRSBH9HddQEy2oeRxnWLrbvFFh95']
  return balances
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
  methodology:
    "To obtain the Mercurial TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the 3pool addresses and the SOL 2pool address where the corresponding tokens were deposited and these addresses are hard-coded. This returns the number of tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.",
}