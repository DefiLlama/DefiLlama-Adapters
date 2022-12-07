const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, getTokenBalance, } = require("../helper/solana");
const sdk = require('@defillama/sdk')
const idl = require("./idl.json");
const MM_multisigs = [
  '0xBdaF8c2BAA14f322e1429Ae3869B005590Ea1FF8',
  '0x0fEcA1Ff36AbA721BAEd6C6248b6745C88AF1dDF',
  '0x1d14E27221F1b3c690Fc3cced827bEE4892d0698',
  '0x60daD1DF74F20fd6d6C07e6FC6153078Cd14a57c',
  '0xC6589ad1eed78c50f28249D743A585f7053e7D2C',
]

const vaultMintAuthority = '4nhbsUdKEwVQXuYDotgdQHoMWW83GvjXENwLsf9QrRJT'
const usdcTokenSpl = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

async function tvl() {
  const products = await getProducts()
  const tokenAccounts = []
  products.forEach(({ account: i }) => {
    if (!i.isActive || Buffer.from(i.productName).toString().trim().includes("demo")) return;
    tokenAccounts.push(i.productUnderlyingTokenAccount.toString())
  });

  return sumTokens2({ balances: {
    ['solana:'+usdcTokenSpl]: await getMMbalance()
  }, owner: vaultMintAuthority, tokens: [usdcTokenSpl], tokenAccounts, });
}

async function borrowed() {
  const products = await getProducts()
  const balances = {}
  const usdcBalance = await getTokenBalance(usdcTokenSpl, vaultMintAuthority)
  sdk.util.sumSingleBalance(balances, usdcTokenSpl, -1 * usdcBalance, 'solana')
  sdk.util.sumSingleBalance(balances, usdcTokenSpl, -1 * await getMMbalance(), 'solana')
  products.forEach(({ account: i }) => {
    if (!i.isActive || Buffer.from(i.productName).toString().trim().includes("demo")) return;
    sdk.util.sumSingleBalance(balances,i.underlyingMint.toString(),+i.underlyingAmount, 'solana')
  });
  return balances
}

async function getProducts() {
  const provider = getProvider();
  const programId = "3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs";
  const program = new Program(idl, programId, provider);
  return program.account.product.all();

}

async function getMMbalance() {
  const { output: bals } = await sdk.api.abi.multiCall({
    target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    abi: 'erc20:balanceOf',
    calls: MM_multisigs.map(i => ({ params: i})),
  })
  let total = 0
  bals.forEach(({ output: i}) => total += +i)
  return total
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
};
