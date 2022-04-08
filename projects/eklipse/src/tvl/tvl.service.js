import { CaverService } from "../core/service/caver/caver.service.js";
import BigNumber from "bignumber.js";
import { GAUGE_ADDRESS } from "../constants/gauge-address.constant.js";
import { abi_erc_20 } from "../../resources/abis/erc_20.js";
import { TOKEN_ADDRESS } from "../constants/token-address.constant.js";
import { LOCK_ADDRESS } from "../constants/common.constant.js";
import { abi_klaywap_lp } from "../../resources/abis/klayswap.js";
import { EKL_FARM_ADDRESS } from "../constants/ekl-farm.constant.js";
import { abi_eklipse_lp_3moon } from "../../resources/abis/eklipse_lp_3moon.js";
import { SWAP_ADDRESS } from "../constants/swap-address.constant.js";
import { abi_eklipse_lp_4moon } from "../../resources/abis/eklipse_lp_4moon.js";
import { LPTOKEN_ADDRESS } from "../constants/lptoken-address.constant.js";

const caverService = new CaverService();
const eighteenD = new BigNumber(10).exponentiatedBy(18);

export async function getTVL() {
  const tvl = await calculateTVL();
  return tvl.toFixed(2);
}

async function calculateTVL() {
  const swapTVL = (await getSwapTVL()).dividedBy(eighteenD);
  const eklFarmTVL = await getEKLFarmTVL();
  const gaugeTVL = (await getGaugeTVL()).dividedBy(eighteenD);
  const lockTVL = await getTotalLockEKLValue();

  return BigNumber.sum(swapTVL, gaugeTVL, lockTVL, eklFarmTVL);
}

async function getSwapTVL() {
  const baseSwap = caverService.contract(
    abi_eklipse_lp_3moon,
    SWAP_ADDRESS.BASE
  );
  const basePrice = await baseSwap.methods.getVirtualPrice().call();
  const rawBaseBalance = await baseSwap.methods.getTokenBalances().call();
  const baseBalance = BigNumber.sum(
    rawBaseBalance[0],
    new BigNumber(rawBaseBalance[1]).multipliedBy("1000000000000"),
    new BigNumber(rawBaseBalance[2]).multipliedBy("1000000000000")
  );

  const fMoonSwaps = Object.entries(SWAP_ADDRESS).slice(1);
  const fMoonTVL = fMoonSwaps
    .map(async (row) => {
      const swap = caverService.contract(abi_eklipse_lp_4moon, row[1]);
      const balances = await swap.methods.getTokenBalances().call();
      return BigNumber.sum(
        new BigNumber(balances[0]).multipliedBy(basePrice).dividedBy(eighteenD),
        balances[1]
      );
    })
    .reduce(async (a, b) => {
      return (await a).plus(await b);
    });

  return (await fMoonTVL).plus(baseBalance);
}

async function getEKLFarmTVL() {
  const usdtKslp = caverService.contract(
    abi_erc_20,
    EKL_FARM_ADDRESS.USDT_PAIR
  );
  const klayKslp = caverService.contract(
    abi_erc_20,
    EKL_FARM_ADDRESS.KLAY_PAIR
  );

  const usdtLpBalance = await usdtKslp.methods
    .balanceOf(EKL_FARM_ADDRESS.FARM)
    .call();
  const usdtLpPrice = await getEklUsdtLpPrice();
  const klayLpBalance = await klayKslp.methods
    .balanceOf(EKL_FARM_ADDRESS.FARM)
    .call();

  const klayLpPrice = await getEklKlayLpPrice();

  return BigNumber.sum(
    new BigNumber(usdtLpBalance).multipliedBy(usdtLpPrice) / 1e6,
    new BigNumber(klayLpBalance).multipliedBy(klayLpPrice) / 1e18
  );
}

async function getEklUsdtLpPrice() {
  const usdtKslp = caverService.contract(
    abi_klaywap_lp,
    EKL_FARM_ADDRESS.USDT_PAIR
  );
  const usdtKslpERC20 = caverService.contract(
    abi_erc_20,
    EKL_FARM_ADDRESS.USDT_PAIR
  );
  const usdtKslpBalance = await usdtKslp.methods.getCurrentPool().call();
  const usdtKslpTVL = new BigNumber(usdtKslpBalance[1]).multipliedBy(2);
  const usdtKslpTotalSupply = await usdtKslpERC20.methods.totalSupply().call();
  return usdtKslpTVL.dividedBy(usdtKslpTotalSupply);
}

async function getEklKlayLpPrice() {
  const klayKslp = caverService.contract(
    abi_klaywap_lp,
    EKL_FARM_ADDRESS.KLAY_PAIR
  );
  const klayKslpERC20 = caverService.contract(
    abi_erc_20,
    EKL_FARM_ADDRESS.KLAY_PAIR
  );

  const eklPrice = await getEKLPrice();
  const klayKslpBalance = await klayKslp.methods.getCurrentPool().call();
  const klayKslpTVL = new BigNumber(klayKslpBalance[1]).multipliedBy(2);
  const klayKslpTotalSupply = await klayKslpERC20.methods.totalSupply().call();
  return klayKslpTVL.dividedBy(klayKslpTotalSupply).multipliedBy(eklPrice);
}

async function getGaugeTVL() {
  const tokens = Object.keys(GAUGE_ADDRESS);
  const balances = tokens
    .map(async (token) => {
      const swap = caverService.contract(
        abi_eklipse_lp_3moon,
        SWAP_ADDRESS[token]
      );
      const lp = caverService.contract(abi_erc_20, LPTOKEN_ADDRESS[token]);
      const balance = await lp.methods.balanceOf(GAUGE_ADDRESS[token]).call();
      const price = await swap.methods.getVirtualPrice().call();
      return new BigNumber(balance).multipliedBy(price).dividedBy(eighteenD);
    })
    .reduce(async (a, b) => {
      return BigNumber.sum(await a, await b);
    });
  return balances;
}

async function getEKLPrice() {
  const klayswap = caverService.contract(
    abi_klaywap_lp,
    EKL_FARM_ADDRESS.USDT_PAIR
  );
  const rawPrice = await klayswap.methods
    .estimatePos(TOKEN_ADDRESS.EKL, "1000000000000000000")
    .call();
  return new BigNumber(rawPrice).dividedBy(1000000);
}

async function getTokenBalanceWithTokenAddress(tokenAddress, address) {
  const client = caverService.getCaver();
  const decimal = 18;
  const KIP7Client = new client.kct.kip7(tokenAddress);
  const balance = await KIP7Client.methods.balanceOf(address).call();
  return new BigNumber(balance).dividedBy(
    new BigNumber(10).exponentiatedBy(decimal)
  );
}

async function getTotalLockEKLValue() {
  const lockAddress = LOCK_ADDRESS;
  const eklAddress = TOKEN_ADDRESS.EKL;
  const totalEkl = await getTokenBalanceWithTokenAddress(
    eklAddress,
    lockAddress
  );
  const eklPrice = await getEKLPrice();
  return totalEkl.toNumber() * eklPrice.toNumber();
}
