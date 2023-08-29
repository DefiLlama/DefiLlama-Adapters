const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");

// For testing run
// node test.js projects/backbonelabs/index.js

const config = {
  terra2   : {
    coinGeckoId : "terra-luna-2",
    hub         : "terra1l2nd99yze5fszmhl5svyh5fky9wm4nz4etlgnztfu4e8809gd52q04n3ea",
    boneToken   : "terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml",
    coinGeckoMap: {
      "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4": "usd-coin",
      "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF": "tether",
      terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26      : "astroport-fi",
      uluna                                                                 : "terra-luna-2"
    }
  },
  migaloo  : {
    coinGeckoId: "white-whale",
    hub        : "migaloo1mf6ptkssddfmxvhdx0ech0k03ktp6kf9yk59renau2gvht3nq2gqdhts4u",
    boneToken  : "factory/migaloo1mf6ptkssddfmxvhdx0ech0k03ktp6kf9yk59renau2gvht3nq2gqdhts4u/boneWhale"
  },
  chihuahua: {
    coinGeckoId: "chihuahua-token",
    hub        : "chihuahua1psf89r2g9vdlttrjphspcpzzfx87r2r4nl5fg703ky42mp2706wsw5330f",
    boneToken  : "chihuahua1jz5n4aynhpxx7clf2m8hrv9dp5nz83k67fgaxhy4p9dfwl6zssrq3ymr6w"
  }
};

async function getState(chain, contract) {
  if (!contract) {
    return {};
  }
  return await queryContractCosmos({
    contract,
    chain,
    data: { state: {} }
  });
}

async function tvlHub(chain, state) {
  let chainConfig = config[chain];
  let coinGeckoId = chainConfig.coinGeckoId;

  state ||= await getState(chain, chainConfig.hub);

  let tvl =
        +(state.total_native ?? 0) / getDecimalFactor(chainConfig);

  return {
    [coinGeckoId]: tvl
  };
}

function getDecimalFactor(chainConfig) {
  let decimals = chainConfig.decimals ?? 6;
  return Math.pow(10, decimals);
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

async function migalooTvl() {
  let chain       = "migaloo";
  let chainConfig = config[chain];
  let state       = await getState(chain, chainConfig.hub);
  return await mergePromises([
    tvlHub(chain, state)
  ]);
}

async function terra2Tvl() {
  let chain       = "terra2";
  let chainConfig = config[chain];
  let state       = await getState(chain, chainConfig.hub);
  return mergePromises([
    tvlHub(chain, state)
  ]);
}

async function chihuahuaTvl() {
  let chain       = "chihuahua";
  let chainConfig = config[chain];
  let state       = await getState(chain, chainConfig.hub);
  return mergePromises([
    tvlHub(chain, state)
  ]);
}

module.exports = {
  timetravel          : false,
  misrepresentedTokens: false,
  methodology         : "Liquid Staking Protocol",
  terra2              : { tvl: () => terra2Tvl() },
  migaloo             : { tvl: () => migalooTvl() },
  chihuahua           : { tvl: () => chihuahuaTvl() }
};
