const { request } = require("graphql-request");
const { isLP } = require("../helper/utils");
const { sumTokensAndLPs } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/http");

const GRAPH_API_ENDPOINT = "https://api.studio.thegraph.com/query/73041/pod-subgraph/version/latest";

const POD_ADDRESS = "0xbef5d404548fab05820e64f92cf043b6a06f9c72";
const POD_WETH_ADDRESS = "0xcbcd3854cbc7f2ec4af1c99dcb32c393d77abf6c";

async function fetchPods(block) {
	const staking = {};
	const pool2 = {};
	const balances = {};

	const query = `
	query GetPods($block: Int!) {
		pods(block: { number: $block }) {
			id
			underlying {
				id
				symbol
			}
			rewards {
				token {
					id
					symbol
				}
			}
		}
	}
    `;

	try {
		const data = await request(GRAPH_API_ENDPOINT, query, { block });
		const _staking = [];
		const _pool2 = [];
		const _balances = [];
		data.pods.forEach((pod) => {
			const _underlying = pod.underlying.id.toLowerCase();
			if (_underlying === POD_ADDRESS) {
				_staking.push([pod.underlying.id, pod.id, false]);
			} else if (_underlying === POD_WETH_ADDRESS) {
				_pool2.push([pod.underlying.id, pod.id, true]);
			} else {
				const _isLp = isLP(pod.underlying.symbol, pod.underlying.id, "base");

				_balances.push([pod.underlying.id, pod.id, _isLp]);
			}

			pod.rewards.forEach((reward) => {
				const _rewardToken = reward.token.id.toLowerCase();
				if (_rewardToken === POD_ADDRESS) {
					_staking.push([reward.token.id, pod.id, false]);
				} else if (_rewardToken === POD_WETH_ADDRESS) {
					_pool2.push([reward.token.id, pod.id, true]);
				} else {
					const _isLp = isLP(reward.token.symbol, reward.token.id, "base");
					_balances.push([reward.token.id, pod.id, _isLp]);
				}
			});
		});

		await sumTokensAndLPs(staking, _staking, block, "base", (addr) => `base:${addr}`);
		await sumTokensAndLPs(pool2, _pool2, block, "base", (addr) => `base:${addr}`);
		await sumTokensAndLPs(balances, _balances, block, "base", (addr) => `base:${addr}`);

		return { balances, staking, pool2 };
	} catch (error) {
		console.log({ error });
	}
}

async function staking(timestamp, _, chainBlocks) {
	const block = await getBlock(timestamp, "base", chainBlocks);
	const { staking } = await fetchPods(block);
	return staking;
}

async function pool2(timestamp, _, chainBlocks) {
	const block = await getBlock(timestamp, "base", chainBlocks);
	const { pool2 } = await fetchPods(block);
	return pool2;
}

async function tvl(timestamp, _, chainBlocks) {
	const block = await getBlock(timestamp, "base", chainBlocks);
	const { balances } = await fetchPods(block);
	return balances;
}

module.exports = {
	base: {
		tvl,
		pool2,
		staking,
	},
	start: 1714168827,
	methodology: "Counts all tokens locked as deposits or rewards in Pods created by PodFactory, including staking and pool2s",
};
