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
    voteEscrow:
      "kujira1mxzfcxpn6cjx4u9zln6ttxuc6fuw6g0cettd6nes74vrt2f22h4q3j5cdz",
    ampToken:
      "factory/kujira1n3fr5f56r2ce0s37wdvwrk98yhhq3unnxgcqus8nzsfxvllk0yxquurqty/ampKUJI",
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
    // currently not running due to node simulation gas issues
    arbVault:
      "migaloo1ey4sn2mkmhew4pdrzk90l9acluvas25qlhuvsfgssw42ugz8yjlqx92j9l",
  },
  osmosis: {
    coinGeckoId: "osmosis",
    hub: "osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9",
    voteEscrow:
      "osmo1vcg9a7zwfeuqwtkya5l34tdgzxnafdzpe22ahphd02uwed43wnfs3wtf8a",
    ampToken:
      "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
  },
  injective: {
    coinGeckoId: "injective-protocol",
    hub: "inj1cdwt8g7nxgtg2k4fn8sj363mh9ahkw2qt0vrnc",
    voteEscrow: "inj1yp0lgxq460ked0egtzyj2nck3mdhr8smfmteh5",
    ampToken: "factory/inj1cdwt8g7nxgtg2k4fn8sj363mh9ahkw2qt0vrnc/ampINJ",
    decimals: 18,
  },
  neutron: {
    farms: [
      "neutron1h4ehzx3j92jv4tkgjy3k2qphh5863l68cyep7vaf83fj6k89l4lqjfyh77",
      "neutron1sfmpf84xacu2la88zzsgende2jjlczswdmhzn7jh6tuhn43jl86q6d0vhj",
      "neutron1smam4j5cypw2vp7un3q8w68sg97zq9s2c95ukwsmpsl2jh4xwzdskxm6az",
      "neutron188xz8cg4uqk4ssg9tcf3q2764ar8ev0jr8qpx2qspchul98ykzuqx58r50",
    ],
    coinGeckoMap: {
      "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349":
        "usd-coin",
      "ibc/57503D7852EF4E1899FE6D71C5E81D7C839F76580F86F21E39348FC2BC9D7CE2":
        "tether",
      "ibc/5751B8BCDA688FD0A8EC0B292EEF1CDEAB4B766B63EC632778B196D317C40C3A":
        "astroport-fi",
      untrn: "neutron-3",
      "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9":
        "cosmos",
    },
  },
};

async function getState(chain, contract) {
  if (!contract) {
    return {};
  }
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

  let tvl =
    +(state.tvl_uluna ?? state.tvl_utoken ?? 0) / getDecimalFactor(chainConfig);
  return {
    [coinGeckoId]: tvl,
  };
}

function getDecimalFactor(chainConfig) {
  let decimals = chainConfig.decimals ?? 6;
  return Math.pow(10, decimals);
}

async function tvlArbVault(chain) {
  let chainConfig = config[chain];
  let coinGeckoId = chainConfig.coinGeckoId;

  if (!chainConfig.arbVault) {
    return {};
  }

  const res = await getState(chain, chainConfig.arbVault);

  let tvl = +(res.balances.tvl_utoken ?? 0) / getDecimalFactor(chainConfig);
  return {
    [coinGeckoId]: tvl,
  };
}

async function tvlAmpGovernance(chain, state) {
  let chainConfig = config[chain];

  if (!chainConfig.ampToken) {
    return {};
  }

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
      [chainConfig.coinGeckoIdAmp]: ampAmount / getDecimalFactor(chainConfig),
    };
  } else {
    state ||= await getState(chain, chainConfig.hub);
    let amount =
      (ampAmount / getDecimalFactor(chainConfig)) * +state.exchange_rate;
    return {
      [chainConfig.coinGeckoId]: amount,
    };
  }
}

async function farm2Tvl(chain, farm) {
  const res = await queryContractCosmos({
    chain: chain,
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

  token1.coinGeckoId = getCoinGeckoId(chain, token1.denom);
  token2.coinGeckoId = getCoinGeckoId(chain, token2.denom);

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

async function productsTvl(chain) {
  let chainConfig = config[chain];
  try {
    let state = await getState(chain, chainConfig.hub);
    return await mergePromises([
      tvlHub(chain, state),
      tvlAmpGovernance(chain, state),
      tvlArbVault(chain).catch((a) => ({})),
      ...(chainConfig.farms ?? []).map((farm) => farm2Tvl(chain, farm)),
    ]);
  } catch (error) {
    let url = error?.response?.config?.url;
    if (url) {
      console.log("Issue calling", error?.response?.config?.url);
    }
    throw error;
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Liquid Staking and Arbitrage Protocol",
  terra2: { tvl: () => productsTvl("terra2") },
  terra: { tvl: () => productsTvl("terra") },
  kujira: { tvl: () => productsTvl("kujira") },
  juno: { tvl: () => productsTvl("juno") },
  migaloo: { tvl: () => productsTvl("migaloo") },
  injective: { tvl: () => productsTvl("injective") },
  osmosis: { tvl: () => productsTvl("osmosis") },
  neutron: { tvl: () => productsTvl("neutron") },
};
