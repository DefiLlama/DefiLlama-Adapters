const { getProvider, } = require('../helper/solana.js')
const { Program } = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js")
const { BN } = require("@coral-xyz/anchor");
const idl = require("./jupiter_lending_idl.json")
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('../helper/solana.js')

const LENDING_PROGRAM_ID = new PublicKey('jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9')
const LIQUIDITY_PROGRAM_ID = new PublicKey('jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC')
const LENDING_REWARDS_RATE_PROGRAM_ID = new PublicKey("jup7TthsMgcR9Y3L277b8Eo9uboVSmu1utkuXHNUKar");

const EXCHANGE_PRICES_PRECISION = new BN(1e12);
const SECONDS_PER_YEAR = new BN(31536e3);
const MAX_REWARDS_RATE = new BN(50 * 1e12);

let lendingProgram
const getLendingProgram = () => {
  const provider = getProvider()
  if (!lendingProgram)
    lendingProgram = new Program(idl, provider)
  return lendingProgram;
}
const getReserve = (asset) => {
  if (typeof asset === 'string') asset = new PublicKey(asset)
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reserve"), asset.toBuffer()],
    LIQUIDITY_PROGRAM_ID
  )[0];
};
const getLendingToken = (assetAddress) => {
  if (typeof assetAddress === 'string') assetAddress = new PublicKey(assetAddress)
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("f_token_mint"), assetAddress.toBuffer()],
    LENDING_PROGRAM_ID
  );
  return pda;
};
const getLending = (assetAddress) => {
  if (typeof assetAddress === 'string') assetAddress = new PublicKey(assetAddress)
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("lending"),
      assetAddress.toBuffer(),
      getLendingToken(assetAddress).toBuffer()
    ],
    LENDING_PROGRAM_ID
  );
  return pda;
};
const getLendingRewardsRateModel = (assetAddress) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lending_rewards_rate_model"), assetAddress.toBuffer()],
    LENDING_REWARDS_RATE_PROGRAM_ID
  );
  return pda;
};


function getAssociatedTokenAddressSync(
  mint,
  owner,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
) {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    associatedTokenProgramId,
  );
  return address;
}

async function getLiquidityExchangePrices(assetAddress) {
  const program = getLendingProgram();
  const account = await program.account.tokenReserve.fetch(
    getReserve(assetAddress)
  );
  return account.supplyExchangePrice;
}
const getTokenTotalSupply = async (asset, conn) => {
  if (asset.equals(PublicKey.default) || asset.toString() === "So11111111111111111111111111111111111111112") {
    console.warn("Token supply for SOL is not available");
    return "0";
  }
  const { value } = await conn.getTokenSupply(asset);
  return value.amount;
};
async function getRewardsRate(asset, totalAssets) {
  const program = getLendingProgram();
  const currentRateModel = await program.account.lendingRewardsRateModel.fetch(
    getLendingRewardsRateModel(asset)
  );
  if (totalAssets.lt(currentRateModel.startTvl)) {
    return {
      rate: new BN(0),
      rewardsEnded: false,
      rewardsStartTime: currentRateModel.startTime
    };
  }
  const rate = currentRateModel.yearlyReward.mul(EXCHANGE_PRICES_PRECISION).div(totalAssets);
  if (rate.gt(MAX_REWARDS_RATE)) {
    return {
      rate: MAX_REWARDS_RATE,
      rewardsEnded: false,
      rewardsStartTime: currentRateModel.startTime
    };
  }
  return {
    rate,
    rewardsEnded: false,
    rewardsStartTime: currentRateModel.startTime
  };
}

async function getNewExchangePrice(lending, connection) {
  const liquidityExchangePrice = await getLiquidityExchangePrices(lending.mint, connection);

  const oldTokenExchangePrice = new BN(lending.tokenExchangePrice.toString());
  const oldLiquidityExchangePrice = new BN(
    lending.liquidityExchangePrice.toString()
  );
  let totalReturnPercent = new BN(0);
  const totalSupply = await getTokenTotalSupply(lending.fTokenMint, connection);
  const totalAssets = oldTokenExchangePrice.mul(new BN(totalSupply)).div(EXCHANGE_PRICES_PRECISION);
  const rewardsRate = await getRewardsRate(lending.mint, totalAssets, connection);
  if (rewardsRate.rate.gt(MAX_REWARDS_RATE)) {
    rewardsRate.rate = new BN(0);
  }
  let lastUpdateTime = new BN(lending.lastUpdateTimestamp.toString());
  if (lastUpdateTime < rewardsRate.rewardsStartTime) {
    lastUpdateTime = rewardsRate.rewardsStartTime;
  }
  totalReturnPercent = rewardsRate.rate.mul(new BN(Math.floor(Date.now() / 1e3)).sub(lastUpdateTime)).div(SECONDS_PER_YEAR);
  const delta = new BN(liquidityExchangePrice).sub(oldLiquidityExchangePrice);
  totalReturnPercent = totalReturnPercent.add(
    delta.mul(new BN(1e14)).div(oldLiquidityExchangePrice)
  );
  return oldTokenExchangePrice.add(
    oldTokenExchangePrice.mul(totalReturnPercent).div(new BN(1e14))
  );
}

async function convertToAssets(asset, shares, connection) {
  if (typeof asset === 'string') asset = new PublicKey(asset)
  if (typeof shares === 'string') shares = new BN(shares)
  const lendingProgram = getLendingProgram();
  const lending$1 = await lendingProgram.account.lending.fetch(getLending(asset));
  const exchangePrice = await getNewExchangePrice(lending$1, connection);
  console.log({ shares, exchangePrice: exchangePrice.toString() })
  return shares.mul(exchangePrice).divRound(EXCHANGE_PRICES_PRECISION);
}


module.exports = {
  getReserve,
  getLendingToken,
  getLending,
  convertToAssets,
  LENDING_PROGRAM_ID,
  LIQUIDITY_PROGRAM_ID,
  getLendingProgram,
  getAssociatedTokenAddressSync
}