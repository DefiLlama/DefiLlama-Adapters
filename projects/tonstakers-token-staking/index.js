const { call, } = require("../helper/chain/ton");
const { sleep } = require("../helper/utils");

const farms = [
  {
    contract: "EQBh2Asg4Opnlgmkw25gpZ7IcmyNPJceLh_51o0lOGwGjvuc",
    name: "GEMSTON",
    token: "0:57e8af5a5d59779d720d0b23cf2fce82e0e355990f2f2b7eb4bba772905297a4",
  },
  {
    contract: "EQDjQOGq_bx9pdjQJhQRK9Lux-YOUwDu1UNM8SevvbG25dEq",
    name: "$PUNK",
    token: "0:9da73e90849b43b66dacf7e92b576ca0978e4fc25f8a249095d7e5eb3fe5eebb",
  },
  {
    contract: "EQA0R317P10bopg5YGnI4B9_cJc0jPbVwnLZu3JuMWdyNgly",
    name: "XROCK",
    token: "0:157c463688a4a91245218052c5580807792cf6347d9757e32f0ee88a179a6549",
  },
  {
    contract: "EQA5BgnWFYQuKjDMgmqsYRTA1S3qjrF1MvmjG-BDEA19j0I9",
    name: "JetTon",
    token: "0:105e5589bc66db15f13c177a12f2cf3b94881da2f4b8e7922c58569176625eb5",
  },
  {
    contract: "EQDw7u6CwkbIfzhfdxITAy09yqvAk59hyCdxbdQCR67ilyn-",
    name: "durev",
    token: "0:74d8327471d503e2240345b06fe1a606de1b5e3c70512b5b46791b429dab5eb1",
  },
  {
    contract: "EQDMMSQsmGocIRUMxXL4MamEGasiANnV6GpKstApK45lVGwc",
    name: "$WEB3",
    token: "0:6d70be0903e3dd3e252407cbad1dca9d69fb665124ea74bf19d4479778f2ed8b",
  },
];

const retrieveFarmTVL = async (farmContract) => {
  const result = await call({
    target: farmContract,
    abi: "get_farming_minter_data",
  })
  return result[3];
};

const getFullTVl = async (api) => {
  for (const farm of farms) {
    const balanceRaw = await retrieveFarmTVL(farm.contract)
    api.add(farm.token, balanceRaw)
    await sleep(1000);
  }
};

module.exports = {
  timetravel: false,
  deadFrom: '2025-02-01',
  hallmarks: [
    [Math.floor(new Date('2025-02-01')/1e3), 'Token staking service is deprecated'],
  ],
  ton: {
    tvl: () => ({}),
    staking: getFullTVl,
  },
};
