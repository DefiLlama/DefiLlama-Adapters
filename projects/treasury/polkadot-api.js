const { ApiPromise, WsProvider } = require("@polkadot/api");

const RELAY_CHAIN_TREASURY = "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB";
const ASSET_HUB_TREASURY = "14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk";
const ASSET_HUB_FELLOWSHIP_SALARY = "13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS";
const ASSET_HUB_FELLOWSHIP_SUB_TREASURY = "16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos";
const ASSET_HUB_MYTHOS_TREASURY = "13gYFscwJFJFqFMNnttzuTtMrApUEmcUARtgFubbChU9g6mh";
const HDX_FELLOWSHIP_SALARY_SWAP = "7KQx4f7yU3hqZHfvDVnSfe6mpgAT8Pxyr67LXHV6nsbZo3Tm";
const HDX_TREASURY_STABLES_SWAP_ONE = "7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY";
const HDX_TREASURY_STABLES_SWAP_TWO = "7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV";

const ASSET_HUB_ASSETS = { USDC: 1337, USDT: 1984 };
const HYDRATION_ASSETS = { USDC: 10, USDT: 22, DOT: 5 };

const DOT_DECIMALS = 1e10;
const MYTHOS_DECIMALS = 1e18;

const RELAY_CHAIN_RPC = "wss://rpc.polkadot.io";
const ASSET_HUB_RPC = "wss://polkadot-asset-hub-rpc.polkadot.io";
const HYDRATION_RPC = "wss://hydradx-rpc.dwellir.com";

async function getRelayChainBalance() {
  try {
    const wsProviderRelay = new WsProvider(RELAY_CHAIN_RPC);
    const apiRelay = await ApiPromise.create({ provider: wsProviderRelay });
    const relayResult = await apiRelay.query.system.account(RELAY_CHAIN_TREASURY);

    const freeRelay = relayResult.data.free.toBigInt();
    const reservedRelay = relayResult.data.reserved.toBigInt();
    const balanceDOT = Number((freeRelay + reservedRelay) / BigInt(DOT_DECIMALS));

    await apiRelay.disconnect();
    return balanceDOT;
  } catch (error) {
    console.error("Error fetching Relay Chain balance:", error);
    return 0;
  }
}

async function getAssetHubBalances() {
  try {
    const wsProviderAssetHub = new WsProvider(ASSET_HUB_RPC);
    const apiAssetHub = await ApiPromise.create({ provider: wsProviderAssetHub });

    const addresses = [
      ASSET_HUB_TREASURY,
      ASSET_HUB_FELLOWSHIP_SALARY,
      ASSET_HUB_FELLOWSHIP_SUB_TREASURY,
    ];

    let dotTotal = 0;
    for (const address of addresses) {
      const account = await apiAssetHub.query.system.account(address);
      const free = account.data.free.toBigInt();
      const reserved = account.data.reserved.toBigInt();
      const balanceDOT = Number((free + reserved) / BigInt(DOT_DECIMALS));
      dotTotal += balanceDOT;
    }

    let usdcTotal = 0;
    let usdtTotal = 0;
    for (const address of addresses) {
      for (const [asset, assetId] of Object.entries(ASSET_HUB_ASSETS)) {
        try {
          const metadata = await apiAssetHub.query.assets.metadata(assetId);
          const decimals = metadata.decimals.toNumber
            ? metadata.decimals.toNumber()
            : Number(metadata.decimals);

          const assetAccount = await apiAssetHub.query.assets.account(assetId, address);
          if (!assetAccount.isNone) {
            const rawAccount = assetAccount.unwrap();
            const assetBalance = Number(
              rawAccount.balance.toBigInt() / BigInt(Math.pow(10, decimals))
            );
            if (asset === "USDC") usdcTotal += assetBalance;
            if (asset === "USDT") usdtTotal += assetBalance;
          }
        } catch (error) {
          console.error(`Error fetching ${asset} balance for ${address}:`, error);
        }
      }
    }

    let mythosBalance = 0;
    try {
      const foreignAssetResult = await apiAssetHub.query.foreignAssets.account(
        {
          parents: 1,
          interior: {
            X1: [{ Parachain: 3369 }],
          },
        },
        ASSET_HUB_MYTHOS_TREASURY
      );

      if (!foreignAssetResult.isNone) {
        const rawAccount = foreignAssetResult.unwrap();
        mythosBalance = Number(rawAccount.balance.toBigInt() / BigInt(MYTHOS_DECIMALS));
      }
    } catch (error) {
      console.error("Error fetching MYTHOS balance:", error);
    }

    await apiAssetHub.disconnect();

    return {
      dot: dotTotal,
      usdc: usdcTotal,
      usdt: usdtTotal,
      mythos: mythosBalance,
    };
  } catch (error) {
    console.error("Error fetching Asset Hub balances:", error);
    return { dot: 0, usdc: 0, usdt: 0, mythos: 0 };
  }
}

async function getHydrationBalances() {
  try {
    const wsProviderHydration = new WsProvider(HYDRATION_RPC);
    const apiHydration = await ApiPromise.create({ provider: wsProviderHydration });

    const addresses = [
      HDX_FELLOWSHIP_SALARY_SWAP,
      HDX_TREASURY_STABLES_SWAP_ONE,
      HDX_TREASURY_STABLES_SWAP_TWO,
    ];

    let dotTotal = 0;
    let usdcTotal = 0;
    let usdtTotal = 0;

    for (const address of addresses) {
      for (const [asset, assetId] of Object.entries(HYDRATION_ASSETS)) {
        try {
          const meta = await apiHydration.query.assetRegistry.assets(assetId);
          const metaHuman = meta.toHuman();

          if (!metaHuman || metaHuman.decimals === undefined) {
            throw new Error(`No decimals found for asset ${assetId}`);
          }

          const decimals = Number(metaHuman.decimals);
          const tokenAccount = await apiHydration.query.tokens.accounts(address, assetId);

          if (tokenAccount && tokenAccount.isSome) {
            const rawTokenAccount = tokenAccount.unwrap();
            const free = rawTokenAccount.free.toBigInt();
            const reserved = rawTokenAccount.reserved.toBigInt();
            const balance = Number((free + reserved) / BigInt(Math.pow(10, decimals)));

            if (asset === "DOT") dotTotal += balance;
            if (asset === "USDC") usdcTotal += balance;
            if (asset === "USDT") usdtTotal += balance;
          } else if (tokenAccount) {
            const free = tokenAccount.free.toBigInt();
            const reserved = tokenAccount.reserved.toBigInt();
            const balance = Number((free + reserved) / BigInt(Math.pow(10, decimals)));

            if (asset === "DOT") dotTotal += balance;
            if (asset === "USDC") usdcTotal += balance;
            if (asset === "USDT") usdtTotal += balance;
          }
        } catch (error) {
          console.error(`Error fetching ${asset} balance for ${address}:`, error);
        }
      }
    }

    await apiHydration.disconnect();

    return {
      dot: dotTotal,
      usdc: usdcTotal,
      usdt: usdtTotal,
    };
  } catch (error) {
    console.error("Error fetching Hydration balances:", error);
    return { dot: 0, usdc: 0, usdt: 0 };
  }
}

async function tvl(api) {
  const assetHubBalances = await getAssetHubBalances();
  const hydrationBalances = await getHydrationBalances();

  const totalUSDC = assetHubBalances.usdc + hydrationBalances.usdc;
  const totalUSDT = assetHubBalances.usdt + hydrationBalances.usdt;
  api.addCGToken("usd-coin", totalUSDC);
  api.addCGToken("tether", totalUSDT);

  api.addCGToken("mythos", assetHubBalances.mythos);

  return api.getBalances();
}

async function ownTokens(api) {
  const relayChainDOT = await getRelayChainBalance();
  const assetHubBalances = await getAssetHubBalances();
  const hydrationBalances = await getHydrationBalances();

  const totalDOT = relayChainDOT + assetHubBalances.dot + hydrationBalances.dot;
  api.addCGToken("polkadot", totalDOT);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  polkadot: { tvl, ownTokens, },
};
