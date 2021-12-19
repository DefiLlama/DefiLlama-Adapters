const BigNumber = require("bignumber.js");
const { PublicKey, Connection } = require("@solana/web3.js");
const { parseReserve } = require("./utils");
const { getTokenBalance } = require("../helper/solana");

async function borrowed() {
  const connection = new Connection("https://solana-api.projectserum.com/");

  const parsedAccounts = await connection
    .getMultipleAccountsInfo(
      [
        new PublicKey("BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw"),
        new PublicKey("GYzjMCXTDue12eUGKKWAqtF5jcBYNmewr6Db6LaguEaX"),
        new PublicKey("3PArRsZQ6SLkr1WERZWyC6AqsajtALMq4C66ZMYz4dKQ"),
        new PublicKey("5suXmvdbKQ98VonxGCXqViuWRu8k4zgZRxndYKsH2fJg"),
        new PublicKey("8K9WC8xoh2rtQNY7iEGXtPvfbDCi563SdWhCAhuMP2xE"),
        new PublicKey("2dC4V23zJxuv521iYQj8c471jrxYLNQFaGS6YPwtTHMd"),
        new PublicKey("9n2exoMQwMTzfw6NFoFFujxYPndWVLtKREJePssrKb36"),
        new PublicKey("Hthrt4Lab21Yz1Dx9Q4sFW4WVihdBUTtWRQBjPsYHCor"),
        new PublicKey("5Sb6wDpweg6mtYksPJ2pfGbSyikrhR8Ut8GszcULQ83A"),
        new PublicKey("8PbodeaosQP19SjYFx855UMqWxH2HynZLdBXmsrbac36"),
        new PublicKey("CCpirWrgNuBVLdkP2haxLTbD6XqEgaYuVXixbbpxUB6"),
        new PublicKey("CPDiKagfozERtJ33p7HHhEfJERjvfk1VAjMXAFLrvrKP"),
      ],
      "processed"
    )
    .then((unparsedReserves) => {
      return unparsedReserves.map((unparsedReserve) =>
        parseReserve(PublicKey.default, unparsedReserve)
      );
    });

  const [
    usdcAmount,
    btcAmount,
    ethAmount,
    srmAmount,
    usdtAmount,
    fttAmount,
    rayAmount,
    sbrAmount,
    merAmount,
    solAmount,
    msolAmount,
    wewethAmount,
  ] = parsedAccounts.map((acc) => {
    return new BigNumber(
      acc.info.liquidity.borrowedAmountWads.toString()
    ).dividedBy(
      new BigNumber(
        `1${Array(acc.info.liquidity.mintDecimals + 19)
          .fill("")
          .join("0")}`
      )
    );
  });

  return {
    bitcoin: btcAmount,
    "usd-coin": usdcAmount,
    ethereum: ethAmount.plus(wewethAmount),
    serum: srmAmount,
    tether: usdtAmount,
    "ftx-token": fttAmount,
    raydium: rayAmount,
    saber: sbrAmount,
    mercurial: merAmount,
    solana: solAmount,
    msol: msolAmount,
  };
}

async function tvl() {
  const [
    usdcAmount,
    btcAmount,
    ethAmount,
    srmAmount,
    usdtAmount,
    fttAmount,
    rayAmount,
    sbrAmount,
    merAmount,
    solAmount,
    msolAmount,
    wewethAmount,
  ] = await Promise.all([
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
  ]);
  return {
    bitcoin: btcAmount,
    "usd-coin": usdcAmount,
    ethereum: ethAmount + wewethAmount,
    serum: srmAmount,
    tether: usdtAmount,
    "ftx-token": fttAmount,
    raydium: rayAmount,
    saber: sbrAmount,
    mercurial: merAmount,
    solana: solAmount,
    msol: msolAmount,
  };
}

module.exports = {
  timetravel: false,
  solana:{
    tvl,
    borrowed
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [[1635940800, "SLND launch"]],
};
