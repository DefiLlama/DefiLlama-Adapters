const { getConfig } = require("../helper/cache");
const { sumTokens, queryContract, getBalance2, queryV1Beta1V2 } = require('../helper/chain/cosmos');
const owners = ["kujira15e682nq9jees29rm9j3h030af86lq2qtlejgphlspzqcvs9whf2q00nua5"]

async function tvl(api) {

  // Get base balances of DAO treasury
  await sumTokens({
    balances: api.getBalances(),
    owners: owners,
    chain: 'kujira',
    blacklistedTokens: ['factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta']
  });

  // Get value of DAOs Protocol-Owned-Liquidity
  await calcPOLValue(api)
}

async function calcPOLValue(api) {
  const treasury = ["kujira15e682nq9jees29rm9j3h030af86lq2qtlejgphlspzqcvs9whf2q00nua5"]

  // Get list of all BOW LP Pools
  const contracts = await getConfig("mantadao/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const bowPools = contracts["kaiyo-1"].bow.map(x => x.address)

  const denomSupply = await queryV1Beta1V2({ chain: 'kujira', url: '/bank/v1beta1/supply'})

  // Get all balances of treasury
  const treasuryBalances = await getBalance2({
    owner: treasury,
    chain: 'kujira'
  })

  // Calculate outputs of each LP balance
  let treasuryLPDenomBalances = await Promise.all(
    bowPools.map(async (pool) => {
      const lpDenom = `factory/${pool}/ulp`;

      if (treasuryBalances.hasOwnProperty(lpDenom)) {

        const lpDenomSupply = denomSupply.find((supply) => supply.denom == lpDenom)


        if (lpDenomSupply) {
          const supply = lpDenomSupply.amount;

          let poolBalances;

          poolBalances = await queryContract({ contract: pool, chain: 'kujira', data: { pool: {}} });

          const balances = poolBalances.balances;
          const coin0OutRatio = parseInt(balances[0]) / parseInt(supply);
          const coin1OutRatio = parseInt(balances[1]) / parseInt(supply);

          const treasuryLPBalance = treasuryBalances[lpDenom];


          const coin0Out = coin0OutRatio * treasuryLPBalance;
          const coin1Out = coin1OutRatio * treasuryLPBalance;

          const poolConfig = await queryContract({ contract: pool, chain: 'kujira', data: { config:{}} });


          const denom0 = poolConfig.denoms[0];
          const denom1 = poolConfig.denoms[1];

          api.add(denom0, parseInt(coin0Out))
          api.add(denom1, parseInt(coin1Out))
          delete api.getBalances()['kujira:'+lpDenom.replaceAll('/', ':')];
        }
      }
    })
  );

  treasuryLPDenomBalances = treasuryLPDenomBalances.filter(Boolean);

  return treasuryLPDenomBalances;

}

async function ownTokens(api) {
  return sumTokens({
    owners: owners,
    chain: 'kujira',
    tokens: ['factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta']
  });
}

module.exports = {
  timetravel: false,
  deadFrom: '2025-06-25',
  kujira: {
    tvl,
    ownTokens,
  },
}
