const { sumTokens2, nullAddress } = require("../../helper/unwrapLPs");
const abi = require("./abis");
const {
  VAULTS_ADDRESSES,
  BAYC_VAULTS,
  MAYC_VAULTS,
  BAYC_APE_STAKING_STRATEGY,
  MAYC_APE_STAKING_STRATEGY,
  APE_STAKING,
  P2P_APE_STAKING,
  STAKING_CONTRACT,
  APE,
  JPEG,
  PETH_POOL,
  USD_POOL,
  PETH_WETH_F,
  PUSD_USD_F,
  artBlockOwners,
  LP_STAKING,
  helperToNftMapping,
} = require("./addresses");

/**
 *
 * @returns JPEG'd deposit addresses for APE Staking
 */
async function getApeDepositAddresses(api) {
  const [baycPositionIndices, maycPositionIndices] = await Promise.all([
    api.multiCall({
      abi: abi.VAULT_ABI.openPositionIndices,
      calls: BAYC_VAULTS,
    }),
    api.multiCall({
      abi: abi.VAULT_ABI.openPositionIndices,
      calls: MAYC_VAULTS,
    }),
  ]);

  const [baycOwners, maycOwners] = await Promise.all([
    api.multiCall({
      abi: abi.VAULT_ABI.positionOwner,
      calls: baycPositionIndices
        .map((vaultIndices, i) =>
          vaultIndices.map((nftIndex) => ({
            target: BAYC_VAULTS[i],
            params: [nftIndex.toString()],
          }))
        )
        .flat(),
    }),
    api.multiCall({
      abi: abi.VAULT_ABI.positionOwner,
      calls: maycPositionIndices
        .map((vaultIndices, i) =>
          vaultIndices.map((nftIndex) => ({
            target: MAYC_VAULTS[i],
            params: [nftIndex.toString()],
          }))
        )
        .flat(),
    }),
  ]);

  const [baycDepositAddresses, maycDepositAddresses] = await Promise.all([
    api.multiCall({
      abi: abi.STRATEGY_ABI.depositAddress,
      calls: [...new Set(baycOwners)].map((owner) => ({
        target: BAYC_APE_STAKING_STRATEGY,
        params: [owner],
      })),
    }),
    api.multiCall({
      abi: abi.STRATEGY_ABI.depositAddress,
      calls: [...new Set(maycOwners)].map((owner) => ({
        target: MAYC_APE_STAKING_STRATEGY,
        params: [owner],
      })),
    }),
  ]);

  return Array.from(new Set(baycDepositAddresses)).concat(
    Array.from(new Set(maycDepositAddresses))
  );
}

/**
 * @returns the amount of JPEG locked on JPEG'd (trait or ltv boosts)
 */
async function stakingJPEGD(api) {
  const providersAddresses = await api.multiCall({
    abi: "address:nftValueProvider",
    calls: VAULTS_ADDRESSES,
  });

  providersAddresses.push(STAKING_CONTRACT);

  return sumTokens2({ owners: providersAddresses, tokens: [JPEG], api });
}

/**
 * @returns the amount of $APE tokens staked on JPEG'd
 */
async function getStakedApeAmount(api) {
  const [apeDepositAddresses, lastNonce] = await Promise.all([
    getApeDepositAddresses(api),
    api.call({
      target: P2P_APE_STAKING,
      abi: abi.P2P_APE_STAKING_ABI.nextNonce,
    }),
  ]);

  const [apeStakes, offers] = await Promise.all([
    api.multiCall({
      abi: abi.APE_STAKING.stakedTotal,
      target: APE_STAKING,
      calls: apeDepositAddresses,
    }),
    api.multiCall({
      abi: abi.P2P_APE_STAKING_ABI.offers,
      target: P2P_APE_STAKING,
      calls: new Array(Number(lastNonce)).fill(null).map((_, i) => i),
    }),
  ]);

  apeStakes.forEach((v) => api.add(APE, v));
  offers.forEach((v) => api.add(APE, v.apeAmount));
}

async function vaultsTvl(api) {
  // Fetch positions from vaults
  const positions = await api.multiCall({
    calls: VAULTS_ADDRESSES,
    abi: abi.VAULT_ABI.totalPositions,
  });
  let tokens = await api.multiCall({
    abi: "address:nftContract",
    calls: VAULTS_ADDRESSES,
  });
  tokens = tokens.map((i) => i.toLowerCase());
  const transform = (t) => helperToNftMapping[t.toLowerCase()] || t;

  tokens.forEach((v, i) => {
    if (artBlockOwners.has(v)) return;
    api.add(transform(v), positions[i]);
  });
}

async function autocompoundingTvl(api) {
  const curveBalApi = "function balances(uint256) view returns (uint256)";
  const [
    ethInPETHFactory,
    pethGaugeSupply,
    pethGaugeBalance,
    usdInPUSDFactory,
    pusdGaugeSupply,
    pusdGaugeBalance,
  ] = await api.batchCall([
    { target: PETH_POOL, abi: curveBalApi, params: [0] },
    { target: PETH_POOL, abi: "erc20:totalSupply" },
    { target: PETH_WETH_F, abi: "erc20:balanceOf", params: [LP_STAKING] },
    { target: USD_POOL, abi: curveBalApi, params: [1] },
    { target: USD_POOL, abi: "erc20:totalSupply" },
    { target: PUSD_USD_F, abi: "erc20:balanceOf", params: [LP_STAKING] },
  ]);

  api.add(nullAddress, (ethInPETHFactory * pethGaugeSupply) / pethGaugeSupply);
  api.add(
    "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    (usdInPUSDFactory * pusdGaugeBalance) / pusdGaugeSupply
  );
}

async function tvl(api) {
  await Promise.all([
    getStakedApeAmount(api),
    vaultsTvl(api),
    autocompoundingTvl(api),
    sumTokens2({ api, resolveArtBlocks: true, owners: [...artBlockOwners] }),
  ]);
}

module.exports = { tvl, stakingJPEGD };
