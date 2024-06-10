const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");

const SCALLOP_SUI_MARKET_ID = "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9"

async function suiBorrowed(api) {
  const object = await sui.getObject(SCALLOP_SUI_MARKET_ID)

  const balanceSheetsFields = await sui.getDynamicFieldObjects({
    parent: object.fields.vault.fields.balance_sheets.fields.table.fields.id.id,
  });

  const balanceSheets = await sui.getObjects(balanceSheetsFields.map((e) => e.fields.id.id))

  balanceSheets.forEach((e) => {
    const coinType = '0x' + e.fields.name.fields.name
    const amount = new BigNumber(e.fields.value.fields.debt).toString()
    api.add(coinType, amount)
  })
}

async function suiTvl(api) {
  const object = await sui.getObject(SCALLOP_SUI_MARKET_ID)

  const balanceSheetsFields = await sui.getDynamicFieldObjects({
    parent: object.fields.vault.fields.balance_sheets.fields.table.fields.id.id,
  });

  const balanceSheets = await sui.getObjects(balanceSheetsFields.map((e) => e.fields.id.id))

  balanceSheets.forEach((e) => {
    const coinType = '0x' + e.fields.name.fields.name
    const amount = new BigNumber(e.fields.value.fields.cash).toString()
    api.add(coinType, amount)
  })

  const collateralStatsFields = await sui.getDynamicFieldObjects({
    parent: object.fields.collateral_stats.fields.table.fields.id.id,
  });

  const collateralStats = await sui.getObjects(collateralStatsFields.map((e) => e.fields.id.id))

  collateralStats.forEach((e) => {
    const coinType = '0x' + e.fields.name.fields.name
    api.add(coinType, e.fields.value.fields.amount)
  })
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: suiTvl,
    borrowed: suiBorrowed,
  },
}