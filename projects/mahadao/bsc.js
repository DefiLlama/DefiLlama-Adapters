const { sumTokens } = require("../helper/unwrapLPs.js");
const { unwrapTroves } = require("../helper/unwrapLPs");

const bscTokens = require("./bscTokens.json");
Object.keys(bscTokens).forEach(
  (key) => (bscTokens[key] = bscTokens[key].toLowerCase())
);

const chain = "bsc";

const bsc = {
  "apeswap.arthMahaLP": "0x84020eefe28647056eac16cb16095da2ccf25665",
  "apeswap.bnbMahaLP": "0x0a1ba34833798a3d160a8958f39e46fef3fe7f4e",

  "pcs.arthMahaLP": "0xb955d5b120ff5b803cdb5a225c11583cd56b7040",
  "pcs.arthBusdLP": "0x80342bc6125a102a33909d124a6c26CC5D7b8d56",

  busd: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  usdt: "0x55d398326f99059fF775485246999027B3197955",
  arth: "0xb69a424df8c737a122d0e60695382b3eec07ff4b",
  wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  maha: "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b",
};

const replaceMAHAonBSCTransform = (addr) => {
  if (addr.toLowerCase() === "0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b")
    return "mahadao";

  if (addr.toLowerCase() === "0xb69a424df8c737a122d0e60695382b3eec07ff4b")
    return "arth";
  return `bsc:${addr}`;
};

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];
  const tokensAndOwners = [
    [bscTokens.ARTHuval3PS, bscTokens.ARTHuval3PSBasicStaking],
    [bscTokens.ARTHuval3PS, bscTokens.ARTHu3PXBasicStakingV2], // valEPS staking with $MAHA bribes
    [bscTokens.ARTHuval3PS, bscTokens.ARTHuval3PSDotBasicStaking], // DotDot staking with $MAHA bribes
    [bscTokens.ARTHu3PS, bscTokens.ARTHu3PSBasicStakingV2],
  ];

  await sumTokens(
    balances,
    [
      // apeswap ARTH/MAHA
      [bsc.arth, bsc["apeswap.arthMahaLP"]],
      [bsc.maha, bsc["apeswap.arthMahaLP"]],

      // apeswap MAHA/BNB
      [bsc.wbnb, bsc["apeswap.bnbMahaLP"]],
      [bsc.maha, bsc["apeswap.bnbMahaLP"]],

      // pcs MAHA/ARTH
      [bsc.arth, bsc["pcs.arthMahaLP"]],
      [bsc.maha, bsc["pcs.arthMahaLP"]],

      // pcs ARTH/BUSD
      [bsc.arth, bsc["pcs.arthBusdLP"]],
      [bsc.busd, bsc["pcs.arthBusdLP"]],
    ],
    chainBlocks.bsc,
    "bsc",
    replaceMAHAonBSCTransform
  );

  if (balances.arth && balances.mahadao) {
    balances.arth = balances.arth / 1e18;
    balances.mahadao = balances.mahadao / 1e18;
  }

  return sumTokens(balances, tokensAndOwners, block, chain, undefined, {
    resolveLP: true,
    resolveCrv: true,
  });
}

async function tvl(ts, _block, chainBlocks) {
  const balances = {};
  const chain = "bsc";
  const block = chainBlocks[chain];
  const troves = [
    // troves
    "0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE", // wbnb
    "0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB", // busd
    "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // maha
    "0x0f7e695770e1bc16a9a899580828e22b16d93314", // BUSDUSDC-APE-LP
    "0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea", // BUSDUSDT-APE-LP
    "0x3a00861B7040386b580A4168Db9eD5D4D9dDa7BF", // BUSDUSDC-APE-LP-S
    "0x45Bc65D7Bb6d26676D12aC4646c8cC344DCe4e60", // BUSDUSDT-APE-LP-S
    "0x7cce62085AdEFa3fE9572546fD77fF1aA1088BEc", // BUSD-A
  ];
  await unwrapTroves({ balances, troves, chain, block });
  return balances;
}

module.exports = {
  pool2,
  tvl,
};
