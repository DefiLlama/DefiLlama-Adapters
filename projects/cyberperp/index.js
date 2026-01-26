const { gmxExports } = require("../helper/gmx");
const iota = require('../helper/chain/iota')

const vault = "0x35C301Df78a6eD459931F56fBa6Cb2ad71bE606b";

const liquidityPoolVaultId = "0x678997906d044955492c26657aa7fd6efeec9bc84644e82afba3162acbe10fde"; 
const collateralVaultId = "0xc2978fb2c1e4761fc4b5242f34812b3fab3718a52c4d89050efb3df6bdbc7823"; 

const DECIMALS = BigInt(1e6);

async function iotaMoveTvl(api) {
  const [lpData, collateralData] = await Promise.all([
    iota.getObject(liquidityPoolVaultId),
    iota.getObject(collateralVaultId)
  ]);
  const lpVaultBalance = BigInt(lpData?.fields?.coin_store || 0);
  const collateralVaultDataBalance = BigInt(collateralData?.fields?.coin_store || 0);

  const balance = lpVaultBalance + collateralVaultDataBalance
  api.addCGToken('virtue-usd', balance / DECIMALS); 
}

module.exports = {
  methodology: {
    tvl: "IOTA EVM TVL is tracked using GMX-style vault addresses. IOTA Move TVL is calculated by querying the specific balances of the Liquidity Pool and Collateral vault objects.",
  },
  iotaevm: {
    tvl: gmxExports({ vault}),
  },
  iota: {
    tvl: iotaMoveTvl,
  }
};