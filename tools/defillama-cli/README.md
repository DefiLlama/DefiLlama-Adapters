# DefiLlama CLI

A comprehensive command-line interface for querying the entire DefiLlama ecosystem. Provides unified access to chains, protocols, DEXs, bridges, yields, RPCs, and more — with both live API and offline data modes.

## Features

- **14 commands**: chains, chain, protocols, protocol, dexs, dex, bridges, yields, rpc, assets, quote, search, stats, registry
- **Dual data modes**: Live API (`--api`) or local offline data
- **JSON output**: `--json` flag for machine-readable output
- **Chain enrichment**: DEXs, RPCs, and core assets per chain
- **DEX factory extraction**: DEX factory/router addresses from dimension-adapters
- **Zero dependencies**: Python 3 stdlib only
- **Color terminal output**: Formatted tables with syntax highlighting

## Installation

```bash
# Quick install
bash install.sh

# Or manually
cp defillama-cli.py ~/.local/bin/defillama-cli
chmod +x ~/.local/bin/defillama-cli
```

## Usage

```bash
# List top chains by DEX count
defillama-cli chains --top 20 --sort dex

# Get chain details with DEXs, RPCs, and assets
defillama-cli chain base --rpcs --dexs --assets

# List protocols on Ethereum
defillama-cli protocols --chain ethereum --top 10

# Search for DEXs on Base
defillama-cli dexs --chain base --search aero

# Get RPC endpoints
defillama-cli rpc ethereum

# Search across everything
defillama-cli search uniswap

# Get aggregate statistics
defillama-cli stats

# Force live API mode
defillama-cli --api dexs --chain ethereum

# JSON output
defillama-cli --json chains --top 5
```

## Data Pipeline

The `defillama_unified.py` script builds the local offline dataset by:
1. Cloning DefiLlama's dimension-adapters and DefiLlama-Adapters repos
2. Extracting DEX factory/router addresses from adapter source code
3. Extracting adapter registry contracts (Aave V3, Uniswap V2/V3, etc.)
4. Fetching live data from DefiLlama APIs
5. Building a unified JSON dataset for offline CLI usage

```bash
# Build/update local data
python3 defillama_unified.py
```

## Commands

| Command | Description |
|---------|-------------|
| `chains` | List/search chains (sorted by name, DEX count, RPC count, bridge count) |
| `chain <name>` | Chain details with DEXs, RPCs, and core assets |
| `protocols` | List/search protocols (filter by chain, category) |
| `protocol <name>` | Protocol details (TVL, chains, category) |
| `dexs` | List DEXs (filter by chain, search by name) |
| `dex <name>` | DEX details (factory/router addresses, chains) |
| `bridges` | List bridges with volume data |
| `yields` | List yield opportunities (filter by chain, APY) |
| `rpc <chain>` | Get RPC endpoints for a chain |
| `assets` | List core assets with prices |
| `quote` | Get swap quote (token in, token out, amount) |
| `search` | Search across protocols, chains, and DEXs |
| `stats` | Aggregate statistics |
| `registry` | Show adapter registry data |

## Data Sources

- [DefiLlama API](https://defillama.com/docs/api)
- [dimension-adapters](https://github.com/DefiLlama/dimension-adapters) — DEX factory/router addresses
- [DefiLlama-Adapters](https://github.com/DefiLlama/DefiLlama-Adapters) — protocol adapters and registries
