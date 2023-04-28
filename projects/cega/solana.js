const { Program } = require("@project-serum/anchor");
const { getProvider} = require("../helper/solana");
const sdk = require('@defillama/sdk')
const idl = require("./idl.json");

const usdcDecimals = 10 ** 6;

async function getProducts() {
  const provider = getProvider();
  const programId = "3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs";
  const program = new Program(idl, programId, provider);
  return program.account.product.all();
}

async function getSolanaTvl() {
  const products = await getProducts()
  let totalAmount = 0;
  products.forEach(({ account: i }) => {
    if (!i.isActive || Buffer.from(i.productName).toString().trim().includes("demo")) return;
    const underlyingAmount = i.underlyingAmount.toNumber();
    totalAmount += underlyingAmount;
  });
  return totalAmount / usdcDecimals;
}

module.exports = {
  solana: {
     tvl: getSolanaTvl().then((result) => { console.log(result )}),
  }
}