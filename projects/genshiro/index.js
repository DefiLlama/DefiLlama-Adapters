const { ApiPromise, WsProvider } = require("@polkadot/api");
const BN = require("bn.js");

const types = {
	AccountInfo: {
		nonce: "Index",
		consumers: "RefCount",
		providers: "RefCount",
	},
	Address: "AccountId",
	Asset: {
		0: "AssetIdInnerType",
	},
	AssetData: {
		id: "Asset",
		lot: "FixedU128",
		price_step: "FixedU128",
		maker_fee: "FixedU128",
		taker_fee: "FixedU128",
		multi_asset: "Option<MultiAsset>",
		multi_location: "Option<MultiLocation>",
		debt_weight: "DebtWeightType",
		buyout_priority: "u64",
		asset_type: "AssetType",
		is_dex_enabled: "bool",
	},
	AssetId: "Asset",
	AssetIdInnerType: "u64",
	AssetMetrics: {
		period_start: "Duration",
		period_end: "Duration",
		returns: "Vec<FixedNumber>",
		volatility: "FixedNumber",
		correlations: "Vec<(Asset, FixedNumber)>",
	},
	AssetName: "Vec<u8>",
	AssetType: {
		_enum: {
			Native: null,
			Physical: null,
			Synthetic: null,
			Lp: "PoolId",
		},
	},
	Balance: "u64",
	BalanceOf: "Balance",
	BalancesAggregate: {
		total_issuance: "Balance",
		total_debt: "Balance",
	},
	BestPrice: {
		ask: "Option<FixedI64>",
		bid: "Option<FixedI64>",
	},
	BlockNumber: "u64",
	CapVec: {
		head_index: "u32",
		len_cap: "u32",
		items: "Vec<FixedNumber>",
	},
	ChainId: "u8",
	ChunkKey: "u64",
	Currency: {
		_enum: ["UNKNOWN", "Usd", "Eq", "Eth", "Btc", "Eos", "Dot", "Crv"],
	},
	DataPoint: {
		price: "u64",
		account_id: "AccountId",
		block_number: "BlockNumber",
		timestamp: "u64",
	},
	DebtWeightType: "i128",
	DebtWeightTypeInner: "i128",
	DepositNonce: "u64",
	Duration: {
		secs: "u64",
		nanos: "u32",
	},
	FinancialMetrics: {
		period_start: "Duration",
		period_end: "Duration",
		assets: "Vec<Asset>",
		mean_returns: "Vec<FixedNumber>",
		volatilities: "Vec<FixedNumber>",
		correlations: "Vec<FixedNumber>",
		covariances: "Vec<FixedNumber>",
	},
	FixedI64: "i64",
	FixedNumber: "u128",
	FixedU128: "u128",
	Keys: "SessionKeys3",
	LookupSource: "AccountId",
	MarginState: {
		_enum: {
			Good: null,
			SubGood: null,
			MaintenanceStart: "u64",
			MaintenanceIsGoing: "u64",
			MaintenanceTimeOver: "u64",
			MaintenanceEnd: null,
			SubCritical: null,
		},
	},
	Number: "FixedU128",
	OperationRequest: {
		account: "AccountId",
		authority_index: "AuthIndex",
		validators_len: "u32",
		block_num: "BlockNumber",
	},
	OperationRequestDexCorridor: {
		asset: "Asset",
		order_id: "OrderId",
		price: "FixedI64",
		authority_index: "AuthIndex",
		validators_len: "u32",
		block_num: "BlockNumber",
	},
	OperationRequestDexDeleteOrder: {
		asset: "Asset",
		order_id: "OrderId",
		price: "FixedI64",
		who: "AccountId",
		buyout: "Option<Balance>",
		authority_index: "AuthIndex",
		validators_len: "u32",
		block_num: "BlockNumber",
	},
	OperationRequestLiqFm: {
		authority_index: "AuthIndex",
		validators_len: "u32",
		block_num: "BlockNumber",
	},
	Order: {
		order_id: "OrderId",
		account_id: "AccountId",
		side: "OrderSide",
		price: "FixedI64",
		amount: "FixedU128",
		created_at: "u64",
		expiration_time: "u64",
	},
	OrderType: {
		_enum: {
			Limit: "FixedI64",
			Market: null,
		},
	},
	OrderId: "u64",
	OrderSide: {
		_enum: ["Buy", "Sell"],
	},
	PoolId: "u32",
	PoolInfo: {
		owner: "AccountId",
		pool_asset: "AssetId",
		assets: "Vec<AssetId>",
		amplification: "Number",
		fee: "Permill",
		admin_fee: "Permill",
		balances: "Vec<Balance>",
		total_balances: "Vec<Balance>",
	},
	PoolTokenIndex: "u32",
	PortfolioMetrics: {
		period_start: "Duration",
		period_end: "Duration",
		z_score: "u32",
		volatility: "FixedNumber",
		value_at_risk: "FixedNumber",
	},
	Price: "u128",
	PriceLog: {
		latest_timestamp: "Duration",
		prices: "CapVec<Price>",
	},
	PricePayload: {
		public: "[u8; 33]",
		asset: "Asset",
		price: "FixedI64",
		block_number: "BlockNumber",
	},
	PricePeriod: {
		_enum: ["Min", "TenMin", "Hour", "FourHour", "Day"],
	},
	PricePoint: {
		block_number: "BlockNumber",
		timestamp: "u64",
		last_fin_recalc_timestamp: "Timestamp",
		price: "u64",
		data_points: "Vec<DataPoint>",
	},
	PriceUpdate: {
		period_start: "Duration",
		time: "Duration",
		price: "FixedNumber",
	},
	ProposalStatus: {
		_enum: ["Initiated", "Approved", "Rejected"],
	},
	ProposalVotes: {
		votes_for: "Vec<AccountId>",
		votes_against: "Vec<AccountId>",
		status: "ProposalStatus",
		expiry: "BlockNumber",
	},
	ResourceId: "[u8; 32]",
	SignedBalance: {
		_enum: {
			Positive: "Balance",
			Negative: "Balance",
		},
	},
	SubAccType: {
		_enum: ["Bailsman", "Borrower", "Lender"],
	},
	Timestamp: "u64",
	TotalAggregates: {
		collateral: "Balance",
		debt: "Balance",
	},
	TransferReason: {
		_enum: [
			"Common",
			"InterestFee",
			"MarginCall",
			"LiquidityFarming",
			"BailsmenRedistribution",
			"TreasuryEqBuyout",
			"TreasuryBuyEq",
			"Subaccount",
			"Lock",
			"Unlock",
			"Claim",
			"CurveFeeWithdraw",
		],
	},
	UserGroup: {
		_enum: ["Unknown", "Balances", "Bailsmen", "Borrowers", "Lenders"],
	},
	UnsignedPriorityPair: "(u64, u64)",
	VestingInfo: {
		locked: "Balance",
		perBlock: "Balance",
		startingBlock: "BlockNumber",
	},
};

const ASSETS = [
	{ token: "ETH", code: "6648936" },
	{ token: "DOT", code: "6582132" },
	{ token: "CRV", code: "6517366" },
	{ token: "EOS", code: "6647667" },
	{ token: "GENS", code: "1734700659" },
	{ token: "DAI", code: "6578537" },
	{ token: "USDT", code: "1970496628" },
	{ token: "BUSD", code: "1651864420" },
	{ token: "USDC", code: "1970496611" },
	{ token: "BNB", code: "6450786" },
	{ token: "WBTC", code: "2002941027" },
];

const PRECISION = new BN(1_000_000_000);

async function tvl() {
	const provider = new WsProvider("wss://node.genshiro.io");
	const api = await ApiPromise.create({ provider, types });

	const queries = ASSETS.map(({ code }) => {
		return [api.query.eqAggregates.totalUserGroups, ["Balances", { 0: code }]];
	});

	const balances = await api.queryMulti(queries);

	const result = ASSETS.reduce((acc, { token }, i) => {
		return {
			...acc,
			[token]: new BN(balances[i].collateral).div(PRECISION).toNumber(),
		};
	}, {});

	return result;
}

module.exports = {
	tvl,
};
