const { queryContract } = require("../helper/chain/terra");

// For testing run
// node test.js projects/eris-protocol/index.js

const config = {
  terra2_hub:
    "terra10788fkzah89xrdm27zkj5yvhj9x3494lxawzm5qq3vvxcqz2yzaqyd3enk",
  terra2_farms: [
    "terra1lv2cscvakmtaahj8a6kw43zaefzemydwaswrf38sn2s2depv0wls6ut57q",
    "terra1r0ykpvttzxdx573hypmmdzq4g8e2k5cf5ur0rrjhp6mxrux9rmaq9xw9ff",
    "terra1c6vzxwfcfur2fg08n3nhtdlaxpmjd5wk9nztv8fjgfsjgagtghzsfftutt",
    "terra1xskgvsew6u6nmfwv2mc58m4hscr77xw884x65fuxup8ewvvvuyysr5k3lj",
    "terra1q3q88nyhn7a206djjk40xespszrwg26s8j5fswfgsv6cyu8qlsmsncmppe",
    "terra1qv5pklpnqmugqfehsytakk7tj2fsw4kt69xn2gvaq0edsynm9c7qnjecq2",
    "terra1c98f5dg90cyx5uklezsvac46e4c3msq3ghktkmeksyahytsvuh0q438m6c",
    "terra129jsdzd9nm7ywuyr0hlxs3zqm7jle00vtl4akf4wuke4yr5zs82qafcm4n",
    "terra1v4gh6nrps2yjdzqct5m7mwqkfusxgghjvd7sy5dsndsyy86pfyasum2qh5",
    "terra1g0g5ehu2lvdrta9m62yggaa6x375lz5t5zas3xnzmna7kx74szlsw20es6",
    "terra1l4phwrfqyg9l0vzlqcxn0vmnjd45rp5gx620zc2updpc9peazteqfk3y2p",
  ],
  terra2_coinGeckoMap: {
    "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4":
      "usd-coin",
    "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF":
      "tether",
    terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26:
      "astroport-fi",
    uluna: "terra-luna-2",
  },
  terra_hub: "terra1zmf49p3wl7ck2cwer7kghzumfpwhfqk6x893ah",
};

async function terra2Tvl() {
  let results = await Promise.all([
    hub2Tvl(),
    ...config.terra2_farms.map(farm2Tvl),
  ]);

  return merge(results);
}

async function hub2Tvl() {
  const res = await queryContract({
    isTerra2: true,
    contract: config.terra2_hub,
    data: { state: {} },
  });

  return {
    "terra-luna-2": +res.tvl_uluna / 1e6,
  };
}

async function farm2Tvl(farm) {
  const res = await queryContract({
    isTerra2: true,
    contract: farm,
    data: { state: {} },
  });

  let token1 = {
    denom:
      res.locked_assets[0].info?.native_token?.denom ||
      res.locked_assets[0].info?.token?.contract_addr,
    amount: +res.locked_assets[0].amount,
  };

  let token2 = {
    denom:
      res.locked_assets[1].info?.native_token?.denom ||
      res.locked_assets[1].info?.token?.contract_addr,
    amount: +res.locked_assets[1].amount,
  };

  token1.coinGeckoId = getCoinGeckoId(token1.denom);
  token2.coinGeckoId = getCoinGeckoId(token2.denom);

  let results = [];
  if (token1.coinGeckoId) {
    results.push({ [token1.coinGeckoId]: token1.amount / 1e6 });
    if (!token2.coinGeckoId) {
      // if second is not set, use the same value as AMM has 50:50 weight
      results.push({ [token1.coinGeckoId]: token1.amount / 1e6 });
    }
  }
  if (token2.coinGeckoId) {
    results.push({ [token2.coinGeckoId]: token2.amount / 1e6 });
    if (!token1.coinGeckoId) {
      // if first is not set, use the same value as AMM has 50:50 weight
      results.push({ [token2.coinGeckoId]: token2.amount / 1e6 });
    }
  }

  return merge(results);
}

function getCoinGeckoId(denom) {
  return config.terra2_coinGeckoMap[denom];
}

function merge(elements) {
  return elements.reduce((combined, current) => {
    for (const [coinGeckoId, amount] of Object.entries(current)) {
      if (!combined[coinGeckoId]) {
        combined[coinGeckoId] = 0;
      }

      combined[coinGeckoId] += amount;
    }

    return combined;
  }, {});
}

async function terraTvl() {
  const res = await queryContract({
    isTerra2: false,
    contract: config.terra_hub,
    data: { state: {} },
  });

  return {
    "terra-luna": +res.tvl_uluna / 1e6,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking and Arbitrage Protocol",
  terra2: { tvl: terra2Tvl },
  terra: { tvl: terraTvl },
};
