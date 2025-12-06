# Chateau PR Templates for DefiLlama

> **Submission Order**: TVL Adapter (1st) → Pegged Asset (2nd) → Yield Adapter (3rd, after TVL is live)

---

## 1. TVL Adapter PR (DefiLlama-Adapters) - SUBMIT FIRST

```markdown
**NOTE**

#### Please enable "Allow edits by maintainers" while putting up the PR.

---

##### Name (to be shown on DefiLlama):
Chateau

##### Twitter Link:
https://x.com/Chateau_Capital

##### List of audit links if any:
[Add if available]

##### Website Link:
https://chateau.capital

##### Logo (High resolution, will be shown with rounded borders):
[Add logo URL]

##### Current TVL:
~$425k (chUSD + schUSD on Plasma)

##### Treasury Addresses (if the protocol has treasury)
N/A

##### Chain:
Plasma (chainId: 9745)

##### Coingecko ID:
[Leave empty if not listed]

##### Coinmarketcap ID:
[Leave empty if not listed]

##### Short Description (to be shown on DefiLlama):
Chateau provides chUSD, a synthetic dollar backed by private credit, and schUSD, a yield-bearing ERC-4626 vault.

##### Token address and ticker if any:
- chUSD: 0x22222215d4edc5510d23d0886133e7ece7f5fdc1
- schUSD: 0x888888bAb58a7Bd3068110749bC7b63B62Ce874d

##### Category:
CDP

##### Oracle Provider(s):
Pyth Network

##### Implementation Details:
Pyth oracles provide NAV pricing for chUSD and redemption rate for schUSD.

##### Documentation/Proof:
- chUSD/USDT: 0x73303664bd3a81bf8ef7508a4b50ca2bc5839a9ce78e19ee6f076e12374c1e5f
- schUSD/chUSD: 0xdf8468e16ad185361f8841a80906984425a48e8fc3b2cd8750755f705119dc65

##### forkedFrom:
N/A (original implementation)

##### methodology:
- chUSD TVL: tracked via totalSupply() on the ERC-20 contract
- schUSD staking: tracked via totalAssets() on the ERC-4626 vault
- Share price derived via previewRedeem(1e18)

##### Github org/user:
[Add if open source]
```

---

## 2. Pegged Asset PR (peggedassets-server)

```markdown
## chUSD Pegged Asset Adapter

### Asset Details
- **Name**: chUSD (Chateau USD)
- **Symbol**: chUSD
- **Type**: Synthetic Dollar (peggedUSD)
- **Decimals**: 18

### Chain Information
- **Chain**: Plasma (chainId: 9745)
- **Contract**: `0x22222215d4edc5510d23d0886133e7ece7f5fdc1`

### Oracle
- **Provider**: Pyth Network
- **Feed ID**: `0x73303664bd3a81bf8ef7508a4b50ca2bc5839a9ce78e19ee6f076e12374c1e5f`
- **Feed Name**: CHATEAU US DOLLAR / USDT0 COLLATERALIZATION

### Links
- **Website**: https://chateau.capital
- **App**: https://app.chateau.capital
- **Docs**: https://docs.chateau.capital
- **Twitter**: https://x.com/Chateau_Capital

### Methodology
chUSD supply is tracked via `totalSupply()` on the ERC-20 contract. All chUSD is minted on Plasma chain (no bridges currently).
```

---

## 3. Yield Adapter PR (yield-server) - SUBMIT AFTER TVL IS LIVE

> ⚠️ **Prerequisite**: Must be listed on DefiLlama TVL first!

```markdown
## schUSD Yield Adapter

### Protocol
- **Name**: Chateau
- **Slug**: chateau

### Pool Details
- **Pool**: schUSD Vault
- **Type**: ERC-4626 Yield-Bearing Vault
- **Chain**: Plasma
- **Symbol**: schUSD
- **Underlying**: chUSD

### Contracts
- **schUSD (Vault)**: `0x888888bAb58a7Bd3068110749bC7b63B62Ce874d`
- **chUSD (Underlying)**: `0x22222215d4edc5510d23d0886133e7ece7f5fdc1`

### Oracle
- **Provider**: Pyth Network
- **Feed ID**: `0xdf8468e16ad185361f8841a80906984425a48e8fc3b2cd8750755f705119dc65`
- **Feed Name**: STAKED CHATEAU US DOLLAR / CHATEAU US DOLLAR REDEMPTION RATE

### APY Methodology
- APY is calculated from the ERC-4626 share price change over a 7-day period
- `sharePrice = totalAssets() / totalSupply()`
- `APY = (currentPrice / previousPrice - 1) * (365 / 7) * 100`
- Yield source: Private credit strategies via Covenant VC

### Links
- **Website**: https://www.chateau.capital
- **App**: https://app.chateau.capital
- **Docs**: https://docs.chateau.capital
- **Twitter**: https://x.com/Chateau_Capital
```
