const { get } = require("../helper/http");
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")

const abi = {
  coins: "function coins(uint256 arg0) view returns (address)",
  get_balances: "function get_balances() view returns (uint256[2])",
  lockedLiquidityOf: "function lockedLiquidityOf(address account) view returns (uint256)",
  redemptionQueueAccounting: "function redemptionQueueAccounting() view returns (uint128 etherLiabilities, uint128 unclaimedFees)",
  get_balances2: "function get_balances() view returns (uint256[])",
}

/**
 * Config Ethereum
 */

const frxETH = "0x5E8422345238F34275888049021821E8E08CAa1f"
const treasury = "0x8306300ffd616049FD7e4b0354a64Da835c1A81C";
const minter = "0xbAFA44EFE7901E04E39Dad13167D089C559c1138";
const redeemer = "0x82bA8da44Cd5261762e629dd5c605b17715727bd"
const st_frxETH = "0x4d9f9D15101EEC665F77210cB999639f760F831E";
const frxeth_ng = '0x9c3B46C0Ceb5B9e304FCd6D88Fc50f7DD24B31Bc'
const stakingProxyConvex_1 = '0x32a2849100ed63878ba8ee6e924EB052A57ecB44'
const stakingProxyConvex_2 = '0x74da8EB74DD94Dbd3B501eb16D8CB2C5222dBDa9'
const stakingConvex_1 = "0x68921998fbc43B360D3cF14a03aF4273CB0cFA44"
const stakingConvex_2 = "0xB4fdD7444E1d86b2035c97124C46b1528802DA35"

const url = "https://api.frax.finance/v2/frxeth/validators"

/**
 * Config Fraxtal
 */

const wfrxETH = "0xFC00000000000000000000000000000000000006"
const treasury_2 = "0x0ae0548Ef97d3eC699cF375e2467E24B2f35847c"
const ezwfrxETH = "0x6e9b6660b94fa74A8087D7ee14Dc28698249D242"

const unwrapperCRV = async (api, lps, treasury) => {
  const [supplies, token0s, token1s, poolBalances, balanceOfs] = await Promise.all([
    api.multiCall({ calls: lps.map((lp) => ({ target: lp.pool })), abi: "erc20:totalSupply" }),
    api.multiCall({ calls: lps.map((lp) => ({ target: lp.pool, params: [0] })), abi: abi.coins }),
    api.multiCall({ calls: lps.map((lp) => ({ target: lp.pool, params: [1] })), abi: abi.coins }),
    api.multiCall({ calls: lps.map((lp) => ({ target: lp.pool })), abi: abi.get_balances }),
    api.multiCall({ calls: lps.map((lp) => ({ target: lp.pool, params: [treasury], skip: lp.balance !== undefined })), abi: "erc20:balanceOf" }),
  ])

  lps.forEach((lp, i) => {
    const supply = supplies[i]
    const token0 = token0s[i]
    const token1 = token1s[i]
    const poolBalance = poolBalances[i]
    const balanceOf = lp.balance !== undefined ? lp.balance : balanceOfs[i];
    api.add(token0, balanceOf * poolBalance[0] / supply, { skipChain: true })
    api.add(token1, balanceOf * poolBalance[1] / supply, { skipChain: true })
  })
};

const unwrapperCRVCVX = async (api, lps, treasury) => {
  const balanceOfs = await api.multiCall({ calls: lps.map((lp) => ({ target: lp.staker, params: [lp.user] })) , abi: abi.lockedLiquidityOf })
  return unwrapperCRV(api, lps.map((lp, i) => ({...lp, balance: balanceOfs[i]})), treasury)
}

const treasuryAssets = async (api, treasury) => {
  await Promise.all([
    unwrapperCRV(api, [{ pool: st_frxETH }, { pool: frxeth_ng }], treasury),
    unwrapperCRVCVX(api, [
      { user: stakingProxyConvex_1, staker: stakingConvex_1, pool: st_frxETH },
      { user: stakingProxyConvex_2, staker: stakingConvex_2, pool: frxeth_ng }
    ], treasury)
  ])

  api.add(frxETH, await api.call({ target: frxETH, params: [treasury], abi: 'erc20:balanceOf' }))
  api.add(ADDRESSES.ethereum.WETH, (await sdk.api.eth.getBalance({ target: treasury })).output)
}

const redeemerAssets = async (api, redeemer) => {
  const unclaimed = await api.call({ target: redeemer, abi: abi.redemptionQueueAccounting })
  api.add(ADDRESSES.ethereum.WETH, unclaimed.unclaimedFees)
  api.add(ADDRESSES.ethereum.WETH, (await sdk.api.eth.getBalance({ target: redeemer })).output)
}

const validatorsAssets = async (api) => {
  const { validators } = await get(url)
  const balances = validators.map((r) => r.balanceDec * Math.pow(10, 18))
  const totalBalance = balances.reduce((acc, balance) => acc + balance, 0);
  api.add(ADDRESSES.ethereum.WETH, totalBalance)
}


const ethTvl = async (api) => {
  await Promise.all([
    treasuryAssets(api, treasury), // frxETH Treasury
    redeemerAssets(api, redeemer), // frxETH redeemer
    validatorsAssets(api) // validators
  ])

  api.add(ADDRESSES.ethereum.WETH, (await sdk.api.eth.getBalance({ target: minter })).output) // frxETH Minter
  api.removeTokenBalance(frxETH)
};

const fraxtalTvl = async (api) => {
    const [supply, token0, token1, poolBalance, balanceOf] = await Promise.all([
      api.call({ target: ezwfrxETH, abi: "erc20:totalSupply" }),
      api.call({ target: ezwfrxETH, params: [0], abi: abi.coins }),
      api.call({ target: ezwfrxETH, params: [1], abi: abi.coins }),
      api.call({ target: ezwfrxETH, abi: abi.get_balances2 }),
      api.call({ target: ezwfrxETH, params: [treasury_2], abi: "erc20:balanceOf" }),
    ])

    api.add(token0 === wfrxETH ? frxETH : token0, balanceOf * poolBalance[0] / supply)
    api.add(token1 === wfrxETH ? frxETH : token1, balanceOf * poolBalance[1] / supply)
    api.add(frxETH, (await sdk.api.eth.getBalance({ target: treasury })).output)
    api.removeTokenBalance(frxETH)
}

module.exports = {
  methodology: "TVL represents all the on-chain assets backing frxETH",
  ethereum: { tvl: ethTvl },
  fraxtal: { tvl: fraxtalTvl }
};
