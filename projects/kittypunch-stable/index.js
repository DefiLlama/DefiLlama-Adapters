const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, sumTokens2 } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { getUniqueAddresses } = require("../helper/utils");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20Abi = require("../helper/abis/erc20.json");
const contracts = require("./contracts.json");

const registryIds = {
	stableswap: 0,
	stableFactory: 3,
	crypto: 5,
	cryptoFactory: 6,
};
const nameCache = {};

const gasTokens = [
	"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
	ADDRESSES.null,
];
async function getNames(chain, tokens) {
	const lowerCaseTokens = tokens.map((i) => i.toLowerCase());
	const mapping = {};
	const missing = [];
	for (const i of lowerCaseTokens) {
		const key = `${chain}-${i}`;
		if (key === "ethereum-0x6b8734ad31d42f5c05a86594314837c416ada984")
			mapping[i] = "";
		else if (nameCache[key] || gasTokens.includes(i))
			mapping[i] = nameCache[key];
		else missing.push(i);
	}

	const res = await sdk.api2.abi.multiCall({
		abi: erc20Abi.name,
		calls: missing,
		chain,
		permitFailure: true,
	});
	res.forEach((name, i) => {
		const key = `${chain}-${missing[i]}`;
		nameCache[key] = name ?? "";
		mapping[missing[i]] = nameCache[key];
	});

	return mapping;
}

const registryIdsReverse = Object.fromEntries(
	Object.entries(registryIds).map((i) => i.reverse()),
);

async function getPool({ chain, block, registry }) {
	const data = await sdk.api2.abi.fetchList({
		chain,
		block,
		target: registry,
		itemAbi: abi.pool_list,
		lengthAbi: abi.pool_count,
		withMetadata: true,
	});
	return data.filter((i) => i.output);
}

function getRegistryType(registryId) {
	if (!registryIdsReverse[registryId])
		throw new Error(`Unknown registry id: ${registryId}`);
	return registryIdsReverse[registryId];
}

async function getPools(block, chain) {
	let { registriesMapping, addressProvider } = contracts[chain];
	if (!registriesMapping) {
		registriesMapping = {};
		if (addressProvider) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			(
				await sdk.api.abi.multiCall({
					block,
					chain,
					calls: Object.values(registryIds).map((r) => ({ params: r })),
					target: addressProvider,
					abi: abi.get_id_info,
				})
			).output
				.filter((r) => r.output.addr !== nullAddress)
				.forEach(
					({
						input: {
							params: [registryId],
						},
						output: { addr },
					}) => {
						const registryType = getRegistryType(registryId);
						registriesMapping[registryType] = addr;
					},
				);
		}
	}
	if (contracts[chain].CurveStableswapFactoryNG) {
		registriesMapping.CurveStableswapFactoryNG =
			contracts[chain].CurveStableswapFactoryNG;
	}
	if (contracts[chain].CurveTricryptoFactoryNG) {
		registriesMapping.CurveTricryptoFactoryNG =
			contracts[chain].CurveTricryptoFactoryNG;
	}
	if (contracts[chain].CurveTwocryptoFactoryNG) {
		registriesMapping.CurveTwocryptoFactoryNG =
			contracts[chain].CurveTwocryptoFactoryNG;
	}
	const poolList = {};
	await Promise.all(
		Object.entries(registriesMapping).map(async ([registry, addr]) => {
			poolList[registry] = await getPool({ chain, block, registry: addr });
		}),
	);

	return poolList;
}

function aggregateBalanceCalls({ coins, nCoins, wrapped }) {
	const toa = [];
	coins.map(({ input, output }, i) => {
		const owner = input.params[0];
		const addToken = (t) => {
			if (t.toLowerCase() === wrapped.toLowerCase())
				toa.push([nullAddress, owner]);
			toa.push([t, owner]);
		};
		if (!Object.keys(nCoins).length) {
			for (const token of output) {
				addToken(token);
			}
		} else {
			for (let index = 0; index < nCoins[i].output[0]; index++) {
				addToken(output[index]);
			}
		}
	});
	return toa;
}

async function unwrapPools({ poolList, registry, chain, block }) {
	if (!poolList.length) return;
	const registryAddress = poolList[0].input.target;

	const callParams = {
		target: registryAddress,
		calls: poolList.map((i) => ({ params: i.output })),
		chain,
		block,
	};
	const { output: coins } = await sdk.api.abi.multiCall({
		...callParams,
		abi: abi.get_coins[registry],
	});
	let nCoins = {};
	if (
		![
			"cryptoFactory",
			"triCryptoFactory",
			"CurveL2TricryptoFactory",
			"CurveTricryptoFactoryNG",
			"CurveTwocryptoFactoryNG",
		].includes(registry)
	)
		nCoins = (
			await sdk.api.abi.multiCall({
				...callParams,
				abi: abi.get_n_coins[registry],
			})
		).output;

	let { wrapped = "", metapoolBases = {}, blacklist = [] } = contracts[chain];
	wrapped = wrapped.toLowerCase();
	const calls = aggregateBalanceCalls({ coins, nCoins, wrapped });
	const allTokens = getUniqueAddresses(calls.map((i) => i[0]));
	const tokenNames = await getNames(chain, allTokens);
	const blacklistedTokens = [...blacklist, ...Object.values(metapoolBases)];
	for (const [token, name] of Object.entries(tokenNames)) {
		if ((name ?? "").startsWith("Curve.fi ")) {
			sdk.log(chain, "blacklisting", name);
			blacklistedTokens.push(token);
		}
	}
	return { tokensAndOwners: calls, blacklistedTokens };
}

function tvl(chain) {
	return async (api) => {
		const { block } = api;
		const balances = {};
		const transform = await getChainTransform(chain);
		const poolLists = await getPools(block, chain);
		const promises = [];

		for (const [registry, poolList] of Object.entries(poolLists))
			promises.push(unwrapPools({ poolList, registry, chain, block }));

		const res = (await Promise.all(promises)).filter((i) => i);
		const tokensAndOwners = res.flatMap((i) => i.tokensAndOwners);
		const blacklistedTokens = res.flatMap((i) => i.blacklistedTokens);
		await sumTokens2({
			balances,
			chain,
			block,
			tokensAndOwners,
			transformAddress: transform,
			blacklistedTokens,
		});
		return balances;
	};
}

const chainTypeExports = (chains) =>
	// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
	chains.reduce((obj, chain) => ({ ...obj, [chain]: { tvl: tvl(chain) } }), {});

module.exports = chainTypeExports(["flow"]);
