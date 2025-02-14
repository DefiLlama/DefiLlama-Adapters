import BigNumber from 'bignumber.js'
import BN from "bn.js";
export default BigNumber;
import { tickIndexToSqrtPriceX64 } from "./tick";
import { getObject } from '../helper/chain/sui';

const SUI_HASUI_POOL_ID = "0x871d8a227114f375170f149f7e9d45be822dd003eba225e83c05ac80828596bc"
const SUI_HASUI_VAULT_ID = "0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270"

BigNumber.config({
  DECIMAL_PLACES: 64,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-64, 64], // equivalent to toExpNeg and toExpPos
  MODULO_MODE: BigNumber.ROUND_DOWN,
  POW_PRECISION: 64,
});

async function calculateGSUIunderlyingSui(gSuiAmount) {
  const fields = (await getObject("0x811fe901ed2a5d75cd125912ad6110efdff8be00fe694601a94167e2bd545ac2")).fields
  const pool = Number(fields.pool)
  const pipe = Number(fields.pipe_debt.fields.value)
  const supply = Number(fields.supply.fields.value)
  const percentage = (pool + pipe)/ supply
  return percentage * Number(gSuiAmount)
}

async function calculatehaSuiSuiVaultShares(lpAmount) {
    const suiHasuiPool = (
        await getObject(SUI_HASUI_POOL_ID)
      )
      const vaultObject = (
        await getObject(SUI_HASUI_VAULT_ID)
      )
    
      const clmmPosition =
        vaultObject.fields.positions[0].fields.clmm_postion.fields;
      const liquidity = new BN(clmmPosition.liquidity);
      const curSqrtPrice = new BN(suiHasuiPool.fields.current_sqrt_price);
      const lowerSqrtPrice = new BN(
        tickIndexToSqrtPriceX64(Number(clmmPosition.tick_lower_index.fields.bits)),
      );
      const upperSqrtPrice = new BN(
        tickIndexToSqrtPriceX64(Number(clmmPosition.tick_upper_index.fields.bits)),
      );
    
      const amount = getCoinAmountFromLiquidity(
        liquidity,
        curSqrtPrice,
        lowerSqrtPrice,
        upperSqrtPrice,
      );
    
      const lpSupply =
        vaultObject.fields.lp_token_treasury.fields.total_supply.fields.value;
    
      const percentage = BigNumber(lpAmount).div(BigNumber(lpSupply));
    
      const coinAShare = percentage.multipliedBy(
        BigNumber(amount.coinA.toString()),
      );
      const coinBShare = percentage.multipliedBy(
        BigNumber(amount.coinB.toString()),
      );
    
      return({
        coinA: coinAShare.decimalPlaces(0).toNumber(),
        coinB: coinBShare.decimalPlaces(0).toNumber(),
      });
    
}

function getCoinAmountFromLiquidity(
  liquidity,
  curSqrtPrice,
  lowerSqrtPrice,
  upperSqrtPrice
) {
  const liq = new BigNumber(liquidity.toString());
  const curSqrtPriceStr = new BigNumber(curSqrtPrice.toString());
  const lowerPriceStr = new BigNumber(lowerSqrtPrice.toString());
  const upperPriceStr = new BigNumber(upperSqrtPrice.toString());
  let coinA;
  let coinB;
  if (curSqrtPrice.lt(lowerSqrtPrice)) {
    coinA = MathUtil.toX64_Decimal(liq)
      .multipliedBy(upperPriceStr.minus(lowerPriceStr))
      .div(lowerPriceStr.multipliedBy(upperPriceStr));
    coinB = new BigNumber(0);
  } else if (curSqrtPrice.lt(upperSqrtPrice)) {
    coinA = MathUtil.toX64_Decimal(liq)
      .multipliedBy(upperPriceStr.minus(curSqrtPriceStr))
      .div(curSqrtPriceStr.multipliedBy(upperPriceStr));

    coinB = MathUtil.fromX64_Decimal(
      liq.multipliedBy(curSqrtPriceStr.minus(lowerPriceStr)),
    );
  } else {
    coinA = new BigNumber(0);
    coinB = MathUtil.fromX64_Decimal(
      liq.multipliedBy(upperPriceStr.minus(lowerPriceStr)),
    );
  }

  return {
    coinA: coinA.decimalPlaces(0),
    coinB: coinB.decimalPlaces(0),
  };
}

class MathUtil {
  static toX64_Decimal(num) {
    return num.multipliedBy(BigNumber(2 ** 64));
  }
  static fromX64_Decimal(num) {
    return num.multipliedBy(BigNumber(2 ** -64));
  }
}


export { getCoinAmountFromLiquidity,calculatehaSuiSuiVaultShares,calculateGSUIunderlyingSui };
