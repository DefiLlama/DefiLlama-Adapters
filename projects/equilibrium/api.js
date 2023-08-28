const { ApiPromise, WsProvider } = require("@polkadot/api");
const BN = require("bn.js");

const capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);

const currencyFromU64 = (u64) => {
    const bytes = [];
    let num = typeof u64 === "number" ? new BN(u64) : u64;
    do {
        bytes.unshift(num.modn(256));
        num = num.divn(256);
    } while (num.gtn(0));
    return capitalize(Buffer.from(bytes).toString("utf8"));
};

const u64FromCurrency = (currency) => {
    const buf = Buffer.from(currency.toLowerCase());
    const size = buf.length;
    return buf.reduce((val, digit, i) => val + Math.pow(256, size - 1 - i) * digit, 0);
};

const ASSETS = {
	// Do not incluede Eq token in product TVL
	"Eq": "",
	"Aca": "Acala",
	"Bnb": "binancecoin",
	"Bnc": "bifrost-native-coin",
	"Cru": "crust-network",
	"Dot": "polkadot",
	"Eqd": "",
	"Lit": "Litentry ",
	"Pha": "Phala",
	"Astr": "Astar",
	"Busd": "binance-usd",
	"Glmr": "Moonbeam",
	"Ibtc": "Bitcoin",
	"Intr": "Interlay",
	"Lpt0": "",
	"Lpt1": "",
	"Para": "parallel-finance",
	"Usdt": "tether",
	"Xdot": "polkadot",
	"Cd613": "polkadot",
	"Cd714": "polkadot",
	"Cd815": "polkadot",
	"Eqdot": "polkadot",
	"Mxeth": "ethereum", 
	"Xdot2": "polkadot",
	"Xdot3": "polkadot",
	"Mxusdc": "usd-coin",
	"Mxwbtc": "wrapped-bitcoin",
};

const PRECISION = 1_000_000_000n;

async function tvl() {
	const provider = new WsProvider("wss://node.pol.equilibrium.io/");
	const api = await ApiPromise.create({ provider });

	const assets = (await api.query.eqAssets.assets()).unwrap();

	const queries = assets.map(({ id }) => {
		return [api.query.eqAggregates.totalUserGroups, ["Balances", { 0: id }]];
	});

	const balances = await api.queryMulti(queries);

	const eqDotPrice = (await api.query.oracle.pricePoints(u64FromCurrency("eqdot"))).unwrap().price.toNumber()
		/ (await api.query.oracle.pricePoints(u64FromCurrency("dot"))).unwrap().price.toNumber();

	const accuracy = 10000;

	const result = assets.reduce((acc, { id }, i) => {
		const symbol = currencyFromU64(id)
		const coiungekoAsset = ASSETS[symbol];
		if (coiungekoAsset)
		{
			let amount = Number(balances[i].collateral.toBigInt() * BigInt(accuracy) / PRECISION) / accuracy;

			// eqDot staking token 
			if (symbol == "Eqdot")
			{
				amount *= eqDotPrice;
			}
			acc[coiungekoAsset] = (acc[coiungekoAsset] ?? 0) + amount;
		}
		return acc;
	}, {});

	console.log(JSON.stringify(result));

	return result;
}

module.exports = {
	equilibrium: {tvl},
}