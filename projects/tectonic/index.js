const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens } = require("../helper/unwrapLPs");
const { BigNumber } = require("bignumber.js");

const tcro = "0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95";
const tokensAndOwners = [
  [
    "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
    "0x543F4Db9BD26C9Eb6aD4DD1C33522c966C625774",
  ], // WETH
  [
    "0x062E66477Faf219F25D27dCED647BF57C3107d52",
    "0x67fD498E94d95972a4A2a44AccE00a000AF7Fe00",
  ], // WBTC
  [
    "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
    "0xB3bbf1bE947b245Aef26e3B6a9D777d7703F4c8e",
  ], // USDC
  [
    "0x66e428c3f67a68878562e79A0234c1F83c208770",
    "0xA683fdfD9286eeDfeA81CF6dA14703DA683c44E5",
  ], // USDT
  [
    "0xF2001B145b43032AAF5Ee2884e456CCd805F677D",
    "0xE1c4c56f772686909c28C319079D41adFD6ec89b",
  ], // DAI
  [
    "0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e",
    "0x4bD41f188f6A05F02b46BB2a1f8ba776e528F9D2",
  ], // TUSD
  [
    "0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2",
    "0xfe6934FDf050854749945921fAA83191Bccf20Ad",
  ], // TONIC
];

const tokenName = {
  "0x543F4Db9BD26C9Eb6aD4DD1C33522c966C625774":
    "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
  "0x67fD498E94d95972a4A2a44AccE00a000AF7Fe00":
    "0x062E66477Faf219F25D27dCED647BF57C3107d52",
  "0xB3bbf1bE947b245Aef26e3B6a9D777d7703F4c8e":
    "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
  "0xA683fdfD9286eeDfeA81CF6dA14703DA683c44E5":
    "0x66e428c3f67a68878562e79A0234c1F83c208770",
  "0xE1c4c56f772686909c28C319079D41adFD6ec89b":
    "0xF2001B145b43032AAF5Ee2884e456CCd805F677D",
  "0x4bD41f188f6A05F02b46BB2a1f8ba776e528F9D2": "0x0000000000085d4780B73119b644AE5ecd22b376", // eth TUSD
  "0xfe6934FDf050854749945921fAA83191Bccf20Ad":
    "0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2",
  "0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95":
    "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
};

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  const croBalance = (
    await sdk.api.eth.getBalance({
      target: tcro,
      block: chainBlocks.cronos,
      chain: "cronos",
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    ["crypto-com-chain"],
    BigNumber(croBalance)
      .div(10 ** 18)
      .toFixed(0)
  );
  await sumTokens(
    balances,
    tokensAndOwners,
    chainBlocks.cronos,
    "cronos",
    (addr) => {
      if (
        addr.toLowerCase() ===
        "0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e".toLowerCase()
      ) {
        return "0x0000000000085d4780B73119b644AE5ecd22b376";
      }
      return `cronos:${addr}`;
    }
  );
  return balances;
}

async function sumBorrowed(
  balances,
  tokensAndOwners,
  block,
  chain = "ethereum",
  transformAddress = (id) => id, 
  transformAmount =(amt)=>amt,
) {
  const borrowedTokens = await sdk.api.abi.multiCall({
    calls: tokensAndOwners.map((t) => ({
      target: t[1],
    })),
    abi: abi.totalBorrows,
    block,
    chain,
  });
  borrowedTokens.output.forEach((result, idx) => {
    const token = result.input.target;
    const balance = result.output;
    sdk.util.sumSingleBalance(balances, transformAddress(token), transformAmount(token, balance));
  });
}

async function borrowed(timestamp, block, chainBlocks) {
  let balances = {};
  let tokensAndOwnersBorrowed=tokensAndOwners.slice()
  tokensAndOwnersBorrowed.push([tcro, tcro])

  await sumBorrowed(
    balances,
    tokensAndOwnersBorrowed,
    chainBlocks.cronos,
    "cronos",
    (addr) => {
      if (
        addr.toLowerCase() ===
        "0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95".toLowerCase()
      ) {
        return "crypto-com-chain";
      }
      if (
        addr.toLowerCase() ===
        "0x4bD41f188f6A05F02b46BB2a1f8ba776e528F9D2".toLowerCase()
      ) {
        return "0x0000000000085d4780B73119b644AE5ecd22b376";
      }
      return `cronos:${tokenName[addr]}`;
    }, 
    (addr, amount)=>{
        if (
       addr.toLowerCase() ===
        "0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95".toLowerCase()) {
        return BigNumber(amount)
      .div(10 ** 18)
      .toFixed(0);
      }
      return amount;
    }
  );
  return balances;
}

module.exports = {
  cronos: {
    tvl,
    borrowed,
  },
};
