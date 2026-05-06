const { Interface, formatUnits } = require("ethers");
const http = require("../helper/http");

const RPC = "https://eticamainnet.eticascan.org";
const CG_ID = "etica";

const FACTORY = "0xfc8dE5A5087c8825AA54E2C57B3FFe0e23784bc3";
const ETI = "0x34c61EA91bAcdA647269d4e310A86b875c09946f";
const ETX = "0xa5A1Bc6307b0b87989B8456D4b35F88a68650044";
const STETX = "0x75d81d03a98CD9195593b8963aF17E13fAa70334";

const iface = new Interface([
  "function allPairs(uint256) view returns (address)",
  "function allPairsLength() view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
]);

async function call(target, method, params = []) {
  const { result, error } = await http.post(RPC, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to: target, data: iface.encodeFunctionData(method, params) }, "latest"],
  });
  if (error) throw new Error(error.message);
  return iface.decodeFunctionResult(method, result);
}

function toNumber(value) {
  return Number(formatUnits(value, 18));
}

async function getETXPriceInETI() {
  const length = (await call(FACTORY, "allPairsLength"))[0];

  for (let i = 0n; i < length; i++) {
    const pair = (await call(FACTORY, "allPairs", [i]))[0];
    const [[token0], [token1], [reserve0, reserve1]] = await Promise.all([
      call(pair, "token0"),
      call(pair, "token1"),
      call(pair, "getReserves"),
    ]);

    if (token0 === ETI && token1 === ETX) return toNumber(reserve0) / toNumber(reserve1);
    if (token0 === ETX && token1 === ETI) return toNumber(reserve1) / toNumber(reserve0);
  }
}

async function getStETXPriceInETX() {
  const [[totalAssets], [totalSupply]] = await Promise.all([
    call(STETX, "totalAssets"),
    call(STETX, "totalSupply"),
  ]);
  return toNumber(totalAssets) / toNumber(totalSupply);
}

async function tvl(api) {
  const length = (await call(FACTORY, "allPairsLength"))[0];
  const etxPriceInETI = await getETXPriceInETI();
  const stETXPriceInETX = await getStETXPriceInETX();
  let tvlInETI = 0;

  for (let i = 0n; i < length; i++) {
    const pair = (await call(FACTORY, "allPairs", [i]))[0];
    const [[token0], [token1], [reserve0, reserve1]] = await Promise.all([
      call(pair, "token0"),
      call(pair, "token1"),
      call(pair, "getReserves"),
    ]);

    const reserve0Amount = toNumber(reserve0);
    const reserve1Amount = toNumber(reserve1);

    if (token0 === ETI && token1 === ETX) tvlInETI += reserve0Amount + reserve1Amount * etxPriceInETI;
    else if (token0 === ETX && token1 === ETI) tvlInETI += reserve0Amount * etxPriceInETI + reserve1Amount;
    else if (token0 === STETX && token1 === ETX) tvlInETI += (reserve0Amount * stETXPriceInETX + reserve1Amount) * etxPriceInETI;
    else if (token0 === ETX && token1 === STETX) tvlInETI += (reserve0Amount + reserve1Amount * stETXPriceInETX) * etxPriceInETI;
    else if (token0 === ETX || token1 === ETX) {
      const etxReserve = token0 === ETX ? reserve0Amount : reserve1Amount;
      tvlInETI += etxReserve * etxPriceInETI * 2;
    }
  }

  api.addCGToken(CG_ID, tvlInETI);
}

async function staking(api) {
  const etxPriceInETI = await getETXPriceInETI();
  const [totalAssets] = await call(STETX, "totalAssets");
  api.addCGToken(CG_ID, toNumber(totalAssets) * etxPriceInETI);
}

module.exports = {
  timetravel: false,
  methodology: "Counts EticaSwap liquidity and prices ETX-denominated pools through the live ETI/ETX pool. Staking counts ETX deposited in the stETX ERC-4626 vault.",
  etica: {
    tvl,
    staking,
  },
};
