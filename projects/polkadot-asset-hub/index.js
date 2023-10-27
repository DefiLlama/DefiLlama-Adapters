const { ApiPromise, WsProvider } = require("@polkadot/api");

async function offers(_, _1, _2, { api: _api }) {
	const wsProvider = new WsProvider("wss://polkadot-asset-hub-rpc.polkadot.io");
	const api = await ApiPromise.create({ provider: wsProvider });

	// Assets (from pallet `assets`) with real value in Polkadot Asset Hub.
	// As of now, the tokens that we identified with real value are three : 
	// 1. polkadot, 2. usdt and 3. usdc
	const assets = {
		DOT: ['polkadot'],
		USDt: [1984, 'tether'],
		USDC: [1337, 'usd-coin'],
	}

	const assetPromiseResults = Object.entries(assets).map(async ([assetSymbol, assetData]) => {
        if (assetSymbol === 'DOT') {
			const [ { tokenDecimals }, dotIssuance] = await Promise.all([
                api.registry.getChainProperties(),
                api.query.balances.totalIssuance(),
            ]);

			const decimals = tokenDecimals.toJSON()[0];
            const balance = dotIssuance.toNumber() / (10 ** decimals);

            return ['polkadot', balance];
        } else {
            const [assetInfo, assetMetaData] = await Promise.all([
                api.query.assets.asset(assetData[0]),
                api.query.assets.metadata(assetData[0]),
            ]);

            const supply = assetInfo.unwrap().supply.toNumber();
            const decimals = assetMetaData.decimals.toHuman();
            const balance = supply / (10 ** decimals);

            return [assetData[1], balance];
        }
    });

    const assetResults = await Promise.all(assetPromiseResults);

	// Foreign Assets with real value in Polkadot Asset Hub.
	// We retrieve all foreign assets found in the foreign assets storage.
	const foreignAssetInfo = await api.query.foreignAssets.asset.entries();
	for (const [assetStorageKeyData, assetInfo] of foreignAssetInfo) {
		const foreignAssetData = assetStorageKeyData.toHuman();

		if (foreignAssetData) {
			const foreignAssetMultiLocationStr = JSON.stringify(
				foreignAssetData[0]
			).replace(/(\d),/g, '$1');

			const foreignAssetMultiLocation = api.registry.createType(
				'XcmV3MultiLocation',
				JSON.parse(foreignAssetMultiLocationStr)
			);

			const assetMetadata =
				await api.query.foreignAssets.metadata(
					foreignAssetMultiLocation
				);
			
			if (assetInfo.isSome) {
				// If the foreign asset is the Kusama token, we have to hardcode the related information 
				// since the metadata for KSM are empty right now.
				if (foreignAssetMultiLocationStr == '{"parents":"2","interior":{"X1":{"GlobalConsensus":"Kusama"}}}') {
					const supply = assetInfo.unwrap().supply.toHuman();
					const decimals = 12;
					const name = 'Kusama';
					const balance = supply / (10 ** decimals);
					const token = name.toLowerCase();

					assetResults.push([token, balance]);
				} else {
					const supply = assetInfo.unwrap().supply.toHuman();
					const decimals = assetMetadata.decimals.toHuman();
					const name = assetMetadata.name.toHuman();			
					const balance = supply / (10 ** decimals);
					const token = name.toLowerCase();

					assetResults.push([token, balance]);
				}
			}
		}
	}

	// Adding all assets & foreign assets to the SDK's balances dictionary
    assetResults.forEach(([token, balance]) => {
        _api.add(token, balance, { skipChain: true });
    });

	return _api.getBalances()
}

module.exports = {
	methodology: "Total Value of Offers - funds of Assets in Polkadot Asset Hub",
	"polkadot_asset_hub": {
		offers,
		tvl: async () => ({})
	}
};
