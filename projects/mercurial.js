const { getTokenBalance } = require("./helper/solana");

async function tvl() {
  const [
    paiPoolUsdcAmount,
    paiPoolUsdtAmount,
    paiPoolPaiAmount,
    psolPoolSolAmount,
    psolPoolPsolAmount,
    usd4PoolUsdcAmount,
    usd4PoolWUsdcAmount,
    usd4PoolWUsdtAmount,
    usd4PoolWDaiAmount,
    stsolPoolStsolAmount,
    stsolPoolSolAmount,
    msolPoolMsolAmount,
    msolPoolSolAmount,
    wbusd4PoolWbusdAmount,
    wbusd4PoolUsdcBsAmount,
    wbusd4PoolUsdcAmount,
    wbusd4PoolUsdtAmount,
    uxd3PoolUxdAmount,
    uxd3PoolUsdcAmount,
    uxd3PoolUsdtAmount,
    usdh3PoolUsdhAmount,
    usdh3PoolUsdcAmount,
    usdh3PoolUsdtAmount,
    aUSDC4poolAaUsdcAmount,
    aUSDC4poolAeUsdcAmount,
    aUSDC4poolUsdcAmount,
    aUSDC4poolApUsdcAmount,
    usn4poolAcUsdAmount,
    usn4poolUsdcAmount,
    usn4poolAfUsdcAmount,
    usn4poolUsnAmount,
    abusd4poolAbUsdcAmount,
    abusd4poolAbBusdAmount,
    abusd4poolUsdcAmount,
    abusd4poolAbUsdtAmount,
    aausdt4poolApUsdtAmount,
    aausdt4poolUsdtAmount,
    aausdt4poolAeUsdtAmount,
    aausdt4poolAaUsdtAmount,
  ] = await Promise.all([
    //pai3pool
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR"
    ),
    getTokenBalance(
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR"
    ),
    getTokenBalance(
      "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
      "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR"
    ),
    //psol2Pool
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3"
    ),
    getTokenBalance(
      "9EaLkQrbjmbbuZG9Wdpo8qfNUEjHATJFSycEmw6f1rGX",
      "8RXqdSRFGLX8iifT2Cu5gD3fG7G4XcEBWCk9X5JejpG3"
    ),
    //wusd4pool
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH"
    ),
    getTokenBalance(
      "A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM",
      "3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH"
    ),
    getTokenBalance(
      "Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1",
      "3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH"
    ),
    getTokenBalance(
      "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o",
      "3m15qNJDM5zydsYNJzkFYXE7iGCVnkKz1mrmbawrDUAH"
    ),
    //stsol2pool
    getTokenBalance(
      "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
      "pG6noYMPVR9ykNgD4XSNa6paKKGGwciU2LckEQPDoSW"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "pG6noYMPVR9ykNgD4XSNa6paKKGGwciU2LckEQPDoSW"
    ),
    //msol2pool
    getTokenBalance(
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "GM48qFn8rnqhyNMrBHyPJgUVwXQ1JvMbcu3b9zkThW9L"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "EWy2hPdVT4uGrYokx65nAyn2GFBv7bUYA2pFPY96pw7Y"
    ),
    //wbusd4pool
    getTokenBalance(
      "5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2",
      "2FRWh8BZfpeuh8Pmg7ezHvBezW8yiEGG6Fy8pCnHVyq1"
    ),
    getTokenBalance(
      "FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA",
      "8m5D8rtDdP67qZyZTXwLozVCsXJMcSiXnroWoRn9GZga"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "5Nn1Fm15FqjD5DbMFBQ93Rrwppzei5GghENMmJt5qRpR"
    ),
    getTokenBalance(
      "8qJSyQprMC57TWKaYEmetUR3UUiTP2M3hXdcvFhkZdmv",
      "3CF2cmVJxnWKt4J4u5tzsNSYVcSvmWqbbb4iJMEmzSRr"
    ),
    //uxd3pool
    getTokenBalance(
      "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT",
      "BLcaKjTnX3ggFMxhUeiZz32mpgiLeKYV2QWQ72JxgjdV"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "GgstY3wF2avMfPd7pAgVWUXaHaPFDkvyjMkTTsPNqmwE"
    ),
    getTokenBalance(
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      "BZRKweQTuVGWKZAL6Qrtgi1HPkuqzKxnJWLLJrqSm8Xs"
    ),
    //usdh3pool
    getTokenBalance(
      "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
      "3bFWy2hz9yGxvbgoRmzjUqkoYbCTWUDu7sZPHUYV39Pf"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "49gyyvxzf61PknHoTg2cFGYQCJRnUrC7Web8h8go7ceM"
    ),
    getTokenBalance(
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      "92P9U8L43ZCAKfdZxJaBAwmbb3MazdoVgrCm7R3xRnhn"
    ),
    //aUSDC4pool
    getTokenBalance(
      "8Yv9Jz4z7BUHP68dz8E8m3tMe6NKgpMUKn8KVqrPA6Fr",
      "2vhaJumb3hbRLUSDDy3Qk8KGGfzqThdwo8ai4tAvztGh"
    ),
    getTokenBalance(
      "DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9",
      "8KX8TLQHfq9UyqNvzUrUCLiECNBdMspMmU8mghdM2SAM"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "CC3FtDKTueNP1pmgtNWvKHZwbznyigSaiGhKsQYAfufD"
    ),
    getTokenBalance(
      "eqKJTf1Do4MDPyKisMYqVaUFpkEFAs3riGF3ceDH2Ca",
      "66guLcMF3qXkrMyLqDfuNKcHc7B6B36id9ZDDww4hiMv"
    ),
    //usn4pool
    getTokenBalance(
      "EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e",
      "HyzoG85bjV9mf5gUjgz7qNxbjT5ojPnA5f4R472wjnaL"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "CQvfEBvq8qBj4RAfB4yksNSg8K8BStdouNjUSnqz22Ky"
    ),
    getTokenBalance(
      "Grk6b4UMRWkgyq4Y6S1BnNRF4hRgtnMFp7Sorkv6Ez4u",
      "9fsBX79ktYFNvQNMmShmatjhyBrsdPa1Q92eHPZZQXDx"
    ),
    getTokenBalance(
      "PUhuAtMHsKavMTwZsLaDeKy2jb7ciETHJP7rhbKLJGY",
      "CGNSvPQV4LaGy6KPag2VUktXjxEig8oQhNasm5itbpSE"
    ),
    //abusd4pool
    getTokenBalance(
      "8XSsNvaKU9FDhYWAv7Yc7qSNwuJSzVrXBNEk7AFiWF69",
      "CRj4DCzp7hDXyNgVhagNJmTmKjtsVLBtPDzjk6JeE2CL"
    ),
    getTokenBalance(
      "6nuaX3ogrr2CaoAPjtaKHAoBNWok32BMcRozuf32s2QF",
      "FEPtjpdDrEMfUTjCkimXH2e3h8KJTjsZYMLC6FtviTUW"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "4ZYrDMtLE3HGWjeE9W2L3psZP7SMASnez9rzqmpfnTxa"
    ),
    getTokenBalance(
      "E77cpQ4VncGmcAXX16LHFFzNBEBb2U7Ar7LBmZNfCgwL",
      "2hHSmtBb7WzCaNFVun7CCmNq445dyQ9e1Tf66GCQGtjV"
    ),
    //aausdt4pool
    getTokenBalance(
      "DNhZkUaxHXYvpxZ7LNnHtss8sQgdAfd1ZYS1fB7LKWUZ",
      "Ez1dYUW8FGhrJGHe4e84JTmyZYFwpjwM7GuhSaBth5Xh"
    ),
    getTokenBalance(
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      "7AiubbXXefRK3Tw83Y2XGovBwZ691pcdkts2S7zNE43Q"
    ),
    getTokenBalance(
      "Bn113WT6rbdgwrm12UJtnmNqGqZjY4it2WoUQuQopFVn",
      "9UMESFcuCBj8bUw6kGDx8zut1g495Y6TcyATm3ht2kqP"
    ),
    getTokenBalance(
      "FwEHs3kJEdMa2qZHv7SgzCiFXUQPEycEXksfBkwmS8gj",
      "FznWTeu44sR9WvqVtekzGQn82z7BxErkcpDDDSmvncYY"
    ),
  ]);
  return {
    "usd-coin":
      paiPoolUsdcAmount +
      usd4PoolUsdcAmount +
      usd4PoolWUsdcAmount +
      wbusd4PoolUsdcBsAmount +
      wbusd4PoolUsdcAmount +
      uxd3PoolUsdcAmount +
      usdh3PoolUsdcAmount +
      aUSDC4poolAaUsdcAmount +
      aUSDC4poolAeUsdcAmount +
      aUSDC4poolUsdcAmount +
      aUSDC4poolApUsdcAmount +
      usn4poolUsdcAmount +
      usn4poolAfUsdcAmount +
      abusd4poolAbUsdcAmount +
      abusd4poolUsdcAmount,
    "celo-dollar": usn4poolAcUsdAmount,
    usdp: paiPoolPaiAmount,
    "binance-usd": wbusd4PoolWbusdAmount + abusd4poolAbBusdAmount,
    "uxd-stablecoin": uxd3PoolUxdAmount,
    usn: usn4poolUsnAmount,
    tether:
      paiPoolUsdtAmount +
      usd4PoolWUsdtAmount +
      wbusd4PoolUsdcBsAmount +
      wbusd4PoolUsdtAmount +
      uxd3PoolUsdtAmount +
      usdh3PoolUsdtAmount +
      abusd4poolAbUsdtAmount +
      aausdt4poolApUsdtAmount +
      aausdt4poolUsdtAmount +
      aausdt4poolAeUsdtAmount +
      aausdt4poolAaUsdtAmount,
    usdh: usdh3PoolUsdhAmount,
    dai: usd4PoolWDaiAmount,
    "lido-staked-sol": stsolPoolStsolAmount,
    msol: msolPoolMsolAmount,
    solana:
      psolPoolSolAmount +
      psolPoolPsolAmount +
      stsolPoolSolAmount +
      msolPoolSolAmount,
  };
}

module.exports = {
  timetravel: false,
  tvl,
  methodology:
    "To obtain the Mercurial TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the 3pool addresses and the SOL 2pool address where the corresponding tokens were deposited and these addresses are hard-coded. This returns the number of tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.",
};
