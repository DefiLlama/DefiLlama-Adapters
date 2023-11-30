const ADDRESSES = require('../helper/coreAssets.json')
const { Program } = require("@project-serum/anchor");
const { getProvider} = require("../helper/solana");
const sdk = require('@defillama/sdk')
const idl = require("./idl.json");

const usdcAddress = ADDRESSES.solana.USDC;
const PURE_OPTIONS_PRODUCTS = [
  'insanic-2',
  'supercharger',
  'go-fast-2'
]

const OPTIONS_AND_BONDS_PRODUCTS = [
  'genesis-basket-2',
  'starboard',
  'cruise-control-2',
  'autopilot'
]

async function getProducts() {
  const provider = getProvider();
  const programId = "3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs";
  const program = new Program(idl, programId, provider);
  return program.account.product.all();
}

async function getSolanaTvl() {
  const balances = {};
  const products = await getProducts()
  let totalAmount = 0;
  products.forEach(({ account: i }) => {
    const productName = Buffer.from(i.productName).toString().trim();
    if (!i.isActive || productName.includes("test")) return;
    const underlyingAmount = i.underlyingAmount.toNumber();
    if(PURE_OPTIONS_PRODUCTS.includes(productName)){
      totalAmount += underlyingAmount;
    }
  });
  await sdk.util.sumSingleBalance(balances, usdcAddress, totalAmount, "solana");
  return balances;
}

async function getBorrowedTvl() {
  const balances = {};
  const products = await getProducts()
  let totalAmount = 0;
  products.forEach(({ account: i }) => {
    const productName = Buffer.from(i.productName).toString().trim();
    if (!i.isActive || productName.includes("test")) return;
    const underlyingAmount = i.underlyingAmount.toNumber();
    if(OPTIONS_AND_BONDS_PRODUCTS.includes(productName)){
      totalAmount += underlyingAmount;
    }
  });
  await sdk.util.sumSingleBalance(balances, usdcAddress, totalAmount, "solana");
  return balances;
}

module.exports = {
  solana: {
     tvl: getSolanaTvl,
     borrowed: getBorrowedTvl,
  }
}