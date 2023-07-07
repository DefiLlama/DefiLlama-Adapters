const {
  queryContract: queryContractCosmos,
  getBalance,
  getBalance2,
} = require("../helper/chain/cosmos");

// For testing run
// node test.js projects/eris-protocol/index.js

const config = {
  terra2: {
    coinGeckoId: "terra-luna-2",
    coinGeckoIdAmp: "eris-amplified-luna",
    hub: "terra10788fkzah89xrdm27zkj5yvhj9x3494lxawzm5qq3vvxcqz2yzaqyd3enk",
    arbVault:
      "terra1r9gls56glvuc4jedsvc3uwh6vj95mqm9efc7hnweqxa2nlme5cyqxygy5m",
    voteEscrow:
      "terra1ep7exp42jjtwgjly36y4vgylz82fplnjwpkz95wljzwfald8zwwqggsdzz",
    ampToken:
      "terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct",
    farms: [
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
    coinGeckoMap: {
      "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4":
        "usd-coin",
      "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF":
        "tether",
      terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26:
        "astroport-fi",
      uluna: "terra-luna-2",
      terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct:
        "eris-amplified-luna",
    },
  },
  terra: {
    coinGeckoId: "terra-luna",
    hub: "terra1zmf49p3wl7ck2cwer7kghzumfpwhfqk6x893ah",
  },
  kujira: {
    coinGeckoId: "kujira",
    hub: "kujira1n3fr5f56r2ce0s37wdvwrk98yhhq3unnxgcqus8nzsfxvllk0yxquurqty",
  },
  juno: {
    coinGeckoId: "juno-network",
    hub: "juno17cya4sw72h4886zsm2lk3udxaw5m8ssgpsl6nd6xl6a4ukepdgkqeuv99x",
  },
  migaloo: {
    coinGeckoId: "white-whale",
    hub: "migaloo1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshqdky4",
    voteEscrow:
      "migaloo1hntfu45etpkdf8prq6p6la9tsnk3u3muf5378kds73c7xd4qdzysuv567q",
    ampToken:
      "factory/migaloo1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshqdky4/ampWHALE",
  },
};

async function getState(chain, contract) {
  return queryContractCosmos({
    contract,
    chain,
    data: { state: {} },
  });
}

async function tvlHub(chain, state) {
  let chainConfig = config[chain];
  let coinGeckoId = chainConfig.coinGeckoId;

  state ||= await getState(chain, chainConfig.hub);

  let tvl = +(state.tvl_uluna ?? state.tvl_utoken ?? 0) / 1e6;
  return {
    [coinGeckoId]: tvl,
  };
}

async function tvlArbVault(chain) {
  let chainConfig = config[chain];
  let coinGeckoId = chainConfig.coinGeckoId;

  const res = await getState(chain, chainConfig.arbVault);

  let tvl = +(res.balances.tvl_utoken ?? 0) / 1e6;
  return {
    [coinGeckoId]: tvl,
  };
}

async function tvlAmpGovernance(chain, state) {
  let chainConfig = config[chain];

  let isTokenFactory = chainConfig.ampToken.startsWith("factory");

  let ampAmount = 0;

  if (isTokenFactory) {
    let balances = await getBalance2({
      owner: chainConfig.voteEscrow,
      token: isTokenFactory,
      chain,
    });

    ampAmount = +(balances[chainConfig.ampToken] ?? 0);
  } else {
    ampAmount = await getBalance({
      owner: chainConfig.voteEscrow,
      token: chainConfig.ampToken,
      chain,
    });
  }

  if (chainConfig.coinGeckoIdAmp) {
    return {
      [chainConfig.coinGeckoIdAmp]: ampAmount / 1e6,
    };
  } else {
    state ||= await getState(chain, chainConfig.hub);
    let amount = (ampAmount / 1e6) * +state.exchange_rate;
    return {
      [chainConfig.coinGeckoId]: amount,
    };
  }
}

async function farm2Tvl(farm) {
  const res = await queryContractCosmos({
    chain: 'terra2',
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

  token1.coinGeckoId = getCoinGeckoId("terra2", token1.denom);
  token2.coinGeckoId = getCoinGeckoId("terra2", token2.denom);

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

function getCoinGeckoId(chain, denom) {
  return config[chain].coinGeckoMap[denom];
}

async function mergePromises(elements) {
  let results = await Promise.all(elements);
  return merge(results);
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

function terraTvl() {
  return mergePromises([tvlHub("terra")]);
}

function kujiraTvl() {
  return mergePromises([tvlHub("kujira")]);
}

function junoTvl() {
  return mergePromises([tvlHub("juno")]);
}

async function migalooTvl() {
  let chain = "migaloo";
  let chainConfig = config[chain];
  let state = await getState(chain, chainConfig.hub);
  return await mergePromises([
    tvlHub(chain, state),
    tvlAmpGovernance(chain, state),
  ]);
}

function terra2Tvl() {
  return mergePromises([
    tvlHub("terra2"),
    tvlArbVault("terra2"),
    tvlAmpGovernance("terra2"),
    ...config.terra2.farms.map(farm2Tvl),
  ]);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking and Arbitrage Protocol",
  terra2: { tvl: terra2Tvl },
  terra: { tvl: terraTvl },
  kujira: { tvl: kujiraTvl },
  juno: { tvl: junoTvl },
  migaloo: { tvl: migalooTvl },
};
