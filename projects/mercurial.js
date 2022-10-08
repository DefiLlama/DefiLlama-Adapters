const { sumTokens2 } = require("./helper/solana");

async function tvl() {
  const tokensAndOwners = [

    // PAI-3Pool
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', '2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR'],
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', '2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR'],
    ['Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS', '2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR'],

    // UST-3Pool
    ['CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm','FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D'], 
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D'], 

    // pSOL-2Pool
    ['9EaLkQrbjmbbuZG9Wdpo8qfNUEjHATJFSycEmw6f1rGX','8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3'], 
    ['So11111111111111111111111111111111111111112','8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3'], 

    // wUSD-4Pool
    ['EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o','3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'], 
    ['A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM','3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'], 
    ['Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1','3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH'], 

    // stSOL-2Pool
    ['So11111111111111111111111111111111111111112','pG6noYMPVR9ykNgD4XSNa6paKKGGwciU2LckEQPDoSW'], 
    ['7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj','pG6noYMPVR9ykNgD4XSNa6paKKGGwciU2LckEQPDoSW'], 

    // mSOL-2Pool
    ['So11111111111111111111111111111111111111112','GcJckEnDiWjpjQ8sqDKuNZjJUKAFZSiuQZ9WmuQpC92a'], 
    ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So','GcJckEnDiWjpjQ8sqDKuNZjJUKAFZSiuQZ9WmuQpC92a'], 

    // wbBUSD-4Pool
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'], 
    ['8qJSyQprMC57TWKaYEmetUR3UUiTP2M3hXdcvFhkZdmv','D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'], 
    ['FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA','D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'], 
    ['5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2','D9QnVSaKxcoYHhXpyhpHWjVhY1xtNxaQbuHocjHKVzf1'], 

    // UXD-3Pool
    ['7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT','62JkSDhZLgwLu8in73E46CPTzEf8hMGMxSNUw5r5mMA8'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','62JkSDhZLgwLu8in73E46CPTzEf8hMGMxSNUw5r5mMA8'], 
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','62JkSDhZLgwLu8in73E46CPTzEf8hMGMxSNUw5r5mMA8'], 

    // USTv2-3Pool
    ['9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i','44K7k9pjjKB6LcWZ1sJ7TvksR3sb4AXpBxwzF1pcEJ5n'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','44K7k9pjjKB6LcWZ1sJ7TvksR3sb4AXpBxwzF1pcEJ5n'], 
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','44K7k9pjjKB6LcWZ1sJ7TvksR3sb4AXpBxwzF1pcEJ5n'], 

    // USDH-3Pool
    ['USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX','F1TVmk1LAaVDGDfEFJWfNLCh9wikZxv33e54ZPeRQzEh'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','F1TVmk1LAaVDGDfEFJWfNLCh9wikZxv33e54ZPeRQzEh'], 
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','F1TVmk1LAaVDGDfEFJWfNLCh9wikZxv33e54ZPeRQzEh'], 

    // aUSDC-4Pool
    ['DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9','5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'], 
    ['8Yv9Jz4z7BUHP68dz8E8m3tMe6NKgpMUKn8KVqrPA6Fr','5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'], 
    ['eqKJTf1Do4MDPyKisMYqVaUFpkEFAs3riGF3ceDH2Ca','5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','5g5yYtiCy3ZrUpfvNg3LXVQDnVJtjmL1eMWXoMgqEuRx'], 

    // acUSD-3Pool
    ['A96PoNcxa9LMxcF9HhKAfA1p3M1dGbubPMWf19gHAkgJ','FhqkDgkhrDY75Tq6rx1ezp6R36AjHsXVvRYJkiyhFoZU'], 
    ['EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e','FhqkDgkhrDY75Tq6rx1ezp6R36AjHsXVvRYJkiyhFoZU'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','FhqkDgkhrDY75Tq6rx1ezp6R36AjHsXVvRYJkiyhFoZU'], 

    // fUSD-3Pool
    ['B7mXkkZgn7abwz1A3HnKkb18Y6y18WcbeSkh1DuLMkee','EdJbEpfASQB99Y2BMUEb5rtgVUcJ2bBUqe59f4JJ9o6t'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','EdJbEpfASQB99Y2BMUEb5rtgVUcJ2bBUqe59f4JJ9o6t'], 
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','EdJbEpfASQB99Y2BMUEb5rtgVUcJ2bBUqe59f4JJ9o6t'], 

    // USN-4Pool
    ['EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e','CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'], 
    ['Grk6b4UMRWkgyq4Y6S1BnNRF4hRgtnMFp7Sorkv6Ez4u','CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'], 
    ['PUhuAtMHsKavMTwZsLaDeKy2jb7ciETHJP7rhbKLJGY','CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','CrUucFMGc8iLxT4uZX965M7iQWozsRxai8ChevwdtXri'], 

    // abBUSD-4Pool
    ['8XSsNvaKU9FDhYWAv7Yc7qSNwuJSzVrXBNEk7AFiWF69','89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'], 
    ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'], 
    ['E77cpQ4VncGmcAXX16LHFFzNBEBb2U7Ar7LBmZNfCgwL','89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'], 
    ['6nuaX3ogrr2CaoAPjtaKHAoBNWok32BMcRozuf32s2QF','89WiJDwdAqjgsKrb9gxXcVgsmh38BBNm13xnPTuXjBwA'], 

    // aaUSDT-4Pool
    ['DNhZkUaxHXYvpxZ7LNnHtss8sQgdAfd1ZYS1fB7LKWUZ','A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'], 
    ['Bn113WT6rbdgwrm12UJtnmNqGqZjY4it2WoUQuQopFVn','A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'], 
    ['FwEHs3kJEdMa2qZHv7SgzCiFXUQPEycEXksfBkwmS8gj','A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'], 
    ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB','A2UHy42vcoKKK4JhNzNTY9PJ5kPcb4EZUSxRAbUtKeUU'], 

  ]

  return sumTokens2({ tokensAndOwners })
}

module.exports = {
  timetravel: false,
  solana: {tvl, },
  methodology:
    "To obtain the Mercurial TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the 3pool addresses and the SOL 2pool address where the corresponding tokens were deposited and these addresses are hard-coded. This returns the number of tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.",
};
