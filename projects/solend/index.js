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
        new PublicKey("CviGNzD2C9ZCMmjDt5DKCce5cLV4Emrcm3NFvwudBFKA"),
        new PublicKey("DUExYJG5sc1SQdMMdq6LdUYW9ULXbo2fFFTbedywgjNN"),
        new PublicKey("5sjkv6HD8wycocJ4tC4U36HHbvgcXYqcyiPRUkncnwWs"),
        new PublicKey("Ab48bKsiEzdm481mGaNVmv9m9DmXsWWxcYHM588M59Yd"),
        new PublicKey("FKZTsydxPShJ8baThobis6qFxTjALMkVC49EA88wqvm7"),
        new PublicKey("8bDyV3N7ctLKoaSVqUoEwUzw6msS2F65yyNPgAVUisKm"),
        new PublicKey("UTABCRXirrbpCNDogCoqEECtM3V44jXGCsK23ZepV3Z"),
        new PublicKey("EjUgEaPpKMg2nqex9obb46gZQ6Ar9mWSdVKbw9A6PyXA"),
        new PublicKey("4XYbgZJirfnwjmpJKQgMQEvjncYFi2CsPTFzBguCjCjG"),
        new PublicKey("AuT5vA4bScsaJBiyNHnAttKToTCHj4Kwi4sg8bCyPPr8"),
        new PublicKey("7MymBKwTPPMC4A9Ktwc1F2V5Xw7Kj3DqvRYUvLk2SF4h"),
        new PublicKey("C5ozcRb4PJeJvakPeGgm9bgwcL6rPcKPfV95d2owW86C"),
        new PublicKey("7trBAMkVU8dcPQVdScz7VNywZwqnD1rwXkwkVPQJ95bT"),
        new PublicKey("HH9Aig5MAvMNcivGfAbWU5Da9nfiTwBaYJBK2KZyZppn"),
        new PublicKey("FCU2wpx3ED1dY7bKszzcyxUVNTduLurUEmCGGv2w3Lfm"),
        new PublicKey("EBRtjgHJiEBYnQ5QzTGcBxTwbapEQ3bvh1BrgaGzhX9e"),
        new PublicKey("3WPYWiZtc2uJq1JiF3Z3KswicFAp5VrFgEHwP3CkuDUn"),
        new PublicKey("A3ZhKMuwHygRqjXiMDqM2PyeT35Z1LiDUqwrtjiHn89M"),
        new PublicKey("8RX5oDxnydPPsA92epWnyXrrM26w7JgAQoVVt9kbiZwq"),
        new PublicKey("5hVVs474TRejwwfqsecNp97riQGDtSmhTV6jiWSxJfWR"),
        new PublicKey("29Znf6g5qmRfTdnbyRQUWvMt94Gzn2KPCzY2ixxY9Mnt"),
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
    softtAmount,
    rayAmount,
    sbrAmount,
    merAmount,
    solAmount,
    msolAmount,
    wewethAmount,
    slndAmount,
    scnsolAmount,
    stsolAmount,
    ustAmount,
    orcaAmount,
    fttAmount,
    turboSolSolAmount,
    turboSolUsdcAmount,
    invictusLsinAmount,
    invictusUsdcAmount,
    invictusUstAmount,
    stepPoolStepAmount,
    stepPoolSolAmount,
    stepPoolXstepAmount,
    stepPoolUsdcAmount,
    fidaPoolUsdcAmount,
    fidaPoolSolAmount,
    fidaPoolFidaAmount,
    atlasPoolAtlasAmount,
    atlasPoolUsdcAmount,
    atlasPoolPolisAmount,
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
    "usd-coin": usdcAmount.plus(turboSolUsdcAmount).plus(invictusUsdcAmount).plus(stepPoolUsdcAmount).plus(fidaPoolUsdcAmount).plus(atlasPoolUsdcAmount),
    ethereum: ethAmount.plus(wewethAmount),
    serum: srmAmount,
    tether: usdtAmount,
    "ftx-token": softtAmount.plus(fttAmount),
    raydium: rayAmount,
    saber: sbrAmount,
    mercurial: merAmount,
    solana: solAmount.plus(turboSolSolAmount).plus(stepPoolSolAmount).plus(fidaPoolSolAmount),
    msol: msolAmount,
    solend: slndAmount,
    "socean-staked-sol": scnsolAmount,
    "lido-staked-sol": stsolAmount,
    terrausd: ustAmount.plus(invictusUstAmount),
    orca: orcaAmount,
    lsin: invictusLsinAmount,
    step: stepPoolStepAmount,
    xStep: stepPoolXstepAmount,
    fida: fidaPoolFidaAmount,
    atlas: atlasPoolAtlasAmount,
    polis: atlasPoolPolisAmount,
  };
}

async function tvl() {
  const [
    usdcAmount,
    btcAmount,
    ethAmount,
    srmAmount,
    usdtAmount,
    softtAmount,
    rayAmount,
    sbrAmount,
    merAmount,
    solAmount,
    msolAmount,
    wewethAmount,
    slndAmount,
    scnsolAmount,
    stsolAmount,
    ustAmount,
    orcaAmount,
    fttAmount,
    turboSolSolAmount,
    turboSolUsdcAmount,
    invictusLsinAmount,
    invictusUsdcAmount,
    invictusUstAmount,
    stepPoolStepAmount,
    stepPoolSolAmount,
    stepPoolXstepAmount,
    stepPoolUsdcAmount,
    fidaPoolUsdcAmount,
    fidaPoolSolAmount,
    fidaPoolFidaAmount,
    atlasPoolAtlasAmount,
    atlasPoolUsdcAmount,
    atlasPoolPolisAmount,
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
    getTokenBalance(
      "SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv",
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "55YceCDfyvdcPPozDiMeNp9TpwmL1hdoTEFw5BMNWbpf"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "55YceCDfyvdcPPozDiMeNp9TpwmL1hdoTEFw5BMNWbpf"
    ),
    getTokenBalance(
      "LsinpBtQH68hzHqrvWw4PYbH7wMoAobQAzcvxVHwTLv",
      "6N6tqnemGoR5pUdtKKp3FvdD94Gi98f2ySEo1dzZ2Uqv"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "6N6tqnemGoR5pUdtKKp3FvdD94Gi98f2ySEo1dzZ2Uqv"
    ),
    getTokenBalance(
      "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
      "6N6tqnemGoR5pUdtKKp3FvdD94Gi98f2ySEo1dzZ2Uqv"
    ),
    getTokenBalance(
      "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT",
      "csotR9rcbLV3bCzBKxNJ3GjYhzH9cXffZX3TAQpw4oG"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "csotR9rcbLV3bCzBKxNJ3GjYhzH9cXffZX3TAQpw4oG"
    ),
    getTokenBalance(
      "xStpgUCss9piqeFUk2iLVcvJEGhAdJxJQuwLkXP555G",
      "csotR9rcbLV3bCzBKxNJ3GjYhzH9cXffZX3TAQpw4oG"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "csotR9rcbLV3bCzBKxNJ3GjYhzH9cXffZX3TAQpw4oG"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "76Asux4XZYqrP61G52eRZRQ6GCUPQUmYme3hTCaNgmxv"
    ),
    getTokenBalance(
      "So11111111111111111111111111111111111111112",
      "76Asux4XZYqrP61G52eRZRQ6GCUPQUmYme3hTCaNgmxv"
    ),
    getTokenBalance(
      "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
      "76Asux4XZYqrP61G52eRZRQ6GCUPQUmYme3hTCaNgmxv"
    ),
    getTokenBalance(
      "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
      "2vhoVMQWEc12dUEEcJ6w8j3ZnrA4Tk6w8pPFhoWfVsUy"
    ),
    getTokenBalance(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "2vhoVMQWEc12dUEEcJ6w8j3ZnrA4Tk6w8pPFhoWfVsUy"
    ),
    getTokenBalance(
      "poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk",
      "2vhoVMQWEc12dUEEcJ6w8j3ZnrA4Tk6w8pPFhoWfVsUy"
    ),
  ]);
  return {
    bitcoin: btcAmount,
    "usd-coin": usdcAmount + turboSolUsdcAmount + invictusUsdcAmount + stepPoolUsdcAmount + fidaPoolUsdcAmount + atlasPoolUsdcAmount,
    ethereum: ethAmount + wewethAmount,
    serum: srmAmount,
    tether: usdtAmount,
    "ftx-token": softtAmount + fttAmount,
    raydium: rayAmount,
    saber: sbrAmount,
    mercurial: merAmount,
    solana: solAmount + turboSolSolAmount + stepPoolSolAmount + fidaPoolSolAmount,
    msol: msolAmount,
    solend: slndAmount,
    "socean-staked-sol": scnsolAmount,
    "lido-staked-sol": stsolAmount,
    terrausd: ustAmount + invictusUstAmount,
    orca: orcaAmount,
    invictus: invictusLsinAmount,
    step: stepPoolStepAmount+stepPoolXstepAmount,
    fida: fidaPoolFidaAmount,
    atlas: atlasPoolAtlasAmount,
    polis: atlasPoolPolisAmount,
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

