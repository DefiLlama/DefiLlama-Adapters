const { PublicKey } = require("@solana/web3.js");
const {
	getAssociatedTokenAddress,
	getConnection,
	getMultipleAccounts,
	sumTokens2,
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} = require("../helper/solana");

const PROGRAM_ID = new PublicKey("mooxHpyFXFemZDNmGQE8KxW93aK8eRVG51nbsK2H52v");

// Anchor discriminator for the Moocon `Vault` account. Filtering on the
// discriminator keeps discovery working if fields are appended to the layout.
const VAULT_DISCRIMINATOR = "cJJWPqNMczr";
const F_TOKEN_MINT_OFFSET = 8 + 32; // discriminator + underlying mint

async function getVaultTokenAccounts(api) {
	const connection = getConnection();
	const vaults = await connection.getProgramAccounts(PROGRAM_ID, {
		filters: [{ memcmp: { offset: 0, bytes: VAULT_DISCRIMINATOR } }],
		dataSlice: { offset: F_TOKEN_MINT_OFFSET, length: 32 },
	});

	const fTokenMints = vaults.map(({ account, pubkey }) => {
		if (account.data.length !== 32)
			throw new Error(`Unexpected Moocon vault layout: ${pubkey.toString()}`);
		return new PublicKey(account.data);
	});
	const mintAccounts = await getMultipleAccounts(fTokenMints, { api });

	return vaults.map(({ pubkey }, index) => {
		const mintAccount = mintAccounts[index];
		if (!mintAccount)
			throw new Error(
				`Missing Moocon fToken mint: ${fTokenMints[index].toString()}`,
			);

		const tokenProgram = mintAccount.owner;
		if (
			!tokenProgram.equals(TOKEN_PROGRAM_ID) &&
			!tokenProgram.equals(TOKEN_2022_PROGRAM_ID)
		)
			throw new Error(
				`Unsupported token program for Moocon fToken: ${fTokenMints[index].toString()}`,
			);

		return getAssociatedTokenAddress(fTokenMints[index], pubkey, tokenProgram);
	});
}

async function tvl(api) {
	return sumTokens2({ api, tokenAccounts: await getVaultTokenAccounts(api) });
}

module.exports = {
	timetravel: false,
	doublecounted: true,
	methodology:
		"TVL is the value of Jupiter Lend tokens held by Moocon vault PDAs, representing deposited principal and accrued yield.",
	solana: { tvl },
};
