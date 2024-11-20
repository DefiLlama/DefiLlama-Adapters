const { getProvider } = require("../helper/solana");
const { Program } = require("@coral-xyz/anchor");
const PlutosoIDL = require("./idl.json");

let program

function getProgram() {
  if (!program) {
    program = new Program(PlutosoIDL, getProvider());
  }
  return program;
}

async function tvl(api) {
  await earnTvl(api)
  await leverageTvl(api)
}

async function borrowed(api) {
  return leverageTvl(api, true)
}

const HNST_VAULT = 'C5uSiUij9P6nWUQBDF8CeJQnYQMeKJWhANRDirGHHD28'

async function staking(api) {
  const pluto = getProgram()

  const earnHnst = await pluto.account.vaultEarn.fetch(HNST_VAULT)

  let unitHnst = earnHnst.unitSupply.toString() / 1e8
  let indexHnst = earnHnst.index.toString() / 1e12
  let amountHnst = unitHnst * indexHnst

  api.add(earnHnst.tokenMint.toString(), amountHnst * (10 ** earnHnst.tokenDecimal));
}

async function earnTvl(api) {
  const pluto = getProgram()
  const vaultData = await pluto.account.vaultEarn.all()
  vaultData.forEach(({ publicKey, account }) => {
    if (publicKey.toString() === HNST_VAULT) return;
    let unit = account.unitSupply.toString() / 1e8
    let index = account.index.toString() / 1e12
    let amount = unit * index
    api.add(account.tokenMint.toString(), amount * (10 ** account.tokenDecimal));
  })
}

async function leverageTvl(api, isBorrow = false) {
  const pluto = getProgram()
  const vaultData = await pluto.account.vaultLeverage.all()
  vaultData.forEach(({ account }) => {
    if (isBorrow) {
      let unit = account.borrowingUnitSupply.toString() / 1e8
      let index = account.borrowingIndex.toString() / 1e12
      let amount = unit * index
      api.add(account.tokenCollateralTokenMint.toString(), amount * (10 ** account.tokenCollateralTokenDecimal));
    } else {
      let unit = account.unitSupply.toString() / 1e8
      let index = account.index.toString() / 1e12
      let amount = unit * index
      api.add(account.nativeCollateralTokenMint.toString(), amount * (10 ** account.nativeCollateralTokenDecimal));
    }
  })
}

module.exports = {
  timetravel: false,
  methodology: "The Total Value Locked (TVL) is calculated as the sum of leveraged position assets and the available assets deposited in Earn Vaults.",
  solana: {
    staking,
    tvl,
    // borrowed,
  },
};
