import {
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
  linea,
  bsc,
  avalanche,
  celo,
  scroll,
  mantle,
  blast,
  unichain,
  opBNB,
  zksync,
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  bscTestnet,
  opBNBTestnet,
  celoAlfajores,
  scrollSepolia,
  polygonAmoy,
  mantleTestnet,
  blastSepolia,
  unichainSepolia,
  lineaSepolia,
  avalancheFuji,
  zksyncSepoliaTestnet,
} from "viem/chains";
import { ChainConfig } from "./types";

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = Object.freeze({
  // L1 Chains
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    chain: mainnet,
    chainString: "ethereum",
    coinId: "ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/",
    blockExplorerUrl: "https://etherscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/eth.svg",
    chainIdHex: "0x1",
    layer: "L1",
    parentChain: undefined,
    isTestnet: false
  },
  bsc: {
    id: "binance-smart-chain",
    name: "BNB Smart Chain",
    chain: bsc,
    chainString: "bsc",
    rpcUrl: "https://bsc-mainnet.infura.io/v3/",
    coinId: "binancecoin",
    blockExplorerUrl: "https://bscscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/binance.svg",
    chainIdHex: "0x38",
    layer: "L1",
    parentChain: undefined,
    isTestnet: false
  },
  avalanche: {
    id: "avalanche",
    name: "Avalanche",
    chain: avalanche,
    chainString: "avalanche",
    rpcUrl: "https://avalanche-mainnet.infura.io/v3/",
    coinId: "avalanche-2",
    blockExplorerUrl: "https://snowtrace.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/avalanche.svg",
    chainIdHex: "0xa86a",
    layer: "L1",
    parentChain: undefined,
    isTestnet: false
  },
  celo: {
    id: "celo",
    name: "Celo",
    chain: celo,
    chainString: "celo",
    rpcUrl: "https://celo-mainnet.infura.io/v3/",
    coinId: "celo",
    blockExplorerUrl: "https://celoscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/celo.svg",
    chainIdHex: "0xa4ec",
    layer: "L1",
    parentChain: undefined,
    isTestnet: false
  },

  // Ethereum L2 Chains
  optimism: {
    id: "optimistic-ethereum",
    name: "Optimism",
    chain: optimism,
    chainString: "optimism",
    rpcUrl: "https://optimism-mainnet.infura.io/v3/",
    coinId: "optimism",
    blockExplorerUrl: "https://optimistic.etherscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/optimism.svg",
    chainIdHex: "0xa",
    layer: "L2",
    parentChain: "ethereum",
  },
  arbitrum: {
    id: "arbitrum-one",
    name: "Arbitrum",
    chain: arbitrum,
    chainString: "arbitrum",
    rpcUrl: "https://arbitrum-mainnet.infura.io/v3/",
    coinId: "arbitrum",
    blockExplorerUrl: "https://arbiscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/arbitrum.svg",
    chainIdHex: "0xa4b1",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  zksync: {
    id: "zksync",
    name: "zkSync Era",
    chain: zksync,
    chainString: "zksync",
    rpcUrl: "https://zksync-mainnet.infura.io/v3/",
    coinId: "zksync",
    blockExplorerUrl: "https://explorer.zksync.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/zksync.svg",
    chainIdHex: "0x144",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  base: {
    id: "base",
    name: "Base",
    nameString: "Base Mainnet",
    chain: base,
    chainString: "base",
    chainString_2: "base-mainnet",
    rpcUrl: "https://base-mainnet.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://basescan.org",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/base.svg",
    chainIdHex: "0x2105",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  scroll: {
    id: "scroll",
    name: "Scroll",
    chain: scroll,
    chainString: "scroll",
    rpcUrl: "https://scroll-mainnet.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://scrollscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/scroll.svg",
    chainIdHex: "0x82750",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  linea: {
    id: "linea",
    name: "Linea",
    chain: linea,
    chainString: "linea",
    rpcUrl: "https://linea-mainnet.infura.io/v3/",
    coinId: "linea",
    blockExplorerUrl: "https://lineascan.build",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/linea.svg",
    chainIdHex: "0xe708",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  blast: {
    id: "blast",
    name: "Blast",
    chain: blast,
    chainString: "blast",
    rpcUrl: "https://blast-mainnet.infura.io/v3/",
    coinId: "blast",
    blockExplorerUrl: "https://blastscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/blast.svg",
    chainIdHex: "0x13e31",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  mantle: {
    id: "mantle",
    name: "Mantle",
    chain: mantle,
    chainString: "mantle",
    rpcUrl: "https://mantle-mainnet.infura.io/v3/",
    coinId: "mantle",
    blockExplorerUrl: "https://explorer.mantle.xyz",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/mantle.svg",
    chainIdHex: "0x1388",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  unichain: {
    id: "unichain",
    name: "UniChain",
    chain: unichain,
    chainString: "unichain",
    rpcUrl: "https://unichain-mainnet.infura.io/v3/",
    coinId: "unichain",
    blockExplorerUrl: "https://explorer.unichain.network",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/refs/heads/master/logo/unichain.png",
    chainIdHex: "0x82",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },
  polygon: {
    id: "polygon-pos",
    name: "Polygon",
    chain: polygon,
    chainString: "polygon",
    rpcUrl: "https://polygon-mainnet.infura.io/v3/",
    coinId: "matic-network",
    blockExplorerUrl: "https://polygonscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/polygon.svg",
    chainIdHex: "0x89",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: false
  },

  // BSC L2 Chains
  opbnb: {
    id: "opbnb",
    name: "opBNB",
    chain: opBNB,
    chainString: "opbnb",
    rpcUrl: "https://opbnb-mainnet.infura.io/v3/",
    coinId: "binancecoin",
    blockExplorerUrl: "https://opbnb.bscscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/refs/heads/master/logo/opbnb.png",
    chainIdHex: "0xcc",
    layer: "L2",
    parentChain: "bsc",
    isTestnet: false
  },

  // Testnets
  sepolia: {
    id: "sepolia",
    name: "Sepolia",
    chain: sepolia,
    chainString: "sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/47a568984a5a4d98b078ca82c69672d5",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/eth.svg",
    chainIdHex: "0xaa36a7",
    layer: "L1",
    parentChain: undefined,
    isTestnet: true
  },
  lineaSepolia: {
    id: "lineaSepolia",
    name: "Linea Sepolia",
    chain: lineaSepolia,
    chainString: "lineaSepolia",
    rpcUrl: "https://linea-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.lineascan.build",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/linea.svg",
    chainIdHex: "0xe705",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  polygonAmoy: {
    id: "polygonAmoy",
    name: "Polygon Amoy",
    chain: polygonAmoy,
    chainString: "polygonAmoy",
    rpcUrl: "https://polygon-amoy.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://amoy.polygonscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/polygon.svg",
    chainIdHex: "0x13882",
    layer: "L1",
    parentChain: undefined,
    isTestnet: true
  },
  baseSepolia: {
    id: "baseSepolia",
    name: "Base Sepolia",
    chain: baseSepolia,
    chainString: "baseSepolia",
    rpcUrl: "https://base-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.basescan.org",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/base.svg",
    chainIdHex: "0x14a34",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  blastSepolia: {
    id: "blastSepolia",
    name: "Blast Sepolia",
    chain: blastSepolia,
    chainString: "blastSepolia",
    rpcUrl: "https://blast-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.blastscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/blast.svg",
    chainIdHex: "0x13e32",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  optimismSepolia: {
    id: "optimismSepolia",
    name: "Optimism Sepolia",
    chain: optimismSepolia,
    chainString: "optimismSepolia",
    rpcUrl: "https://optimism-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia-optimism.etherscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/optimism.svg",
    chainIdHex: "0xaa37dc",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  arbitrumSepolia: {
    id: "arbitrumSepolia",
    name: "Arbitrum Sepolia",
    chain: arbitrumSepolia,
    chainString: "arbitrumSepolia",
    rpcUrl: "https://arbitrum-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.arbiscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/arbitrum.svg",
    chainIdHex: "0x66eee",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  avalancheFuji: {
    id: "avalancheFuji",
    name: "Avalanche Fuji",
    chain: avalancheFuji,
    chainString: "avalancheFuji",
    rpcUrl: "https://avalanche-fuji.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://testnet.snowtrace.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/avalanche.svg",
    chainIdHex: "0xa869",
    layer: "L1",
    parentChain: undefined,
    isTestnet: true
  },
  celoAlfajores: {
    id: "celoAlfajores",
    name: "Celo Alfajores",
    chain: celoAlfajores,
    chainString: "celoAlfajores",
    rpcUrl: "https://celo-alfajores.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://alfajores.celoscan.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/celo.svg",
    chainIdHex: "0xaef3",
    layer: "L1",
    parentChain: undefined,
    isTestnet: true
  },
  zkSyncSepolia: {
    id: "zkSyncSepolia",
    name: "zkSync Sepolia",
    chain: zksyncSepoliaTestnet,
    chainString: "zksyncSepolia",
    rpcUrl: "https://zksync-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.explorer.zksync.io",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/zksync.svg",
    chainIdHex: "0x1442",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  bscTestnet: {
    id: "bscTestnet",
    name: "BSC Testnet",
    chain: bscTestnet,
    chainString: "bscTestnet",
    rpcUrl: "https://bsc-testnet.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://testnet.bscscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/binance.svg",
    chainIdHex: "0x61",
    layer: "L1",
    parentChain: undefined,
    isTestnet: true
  },
  mantleSepolia: {
    id: "mantleSepolia",
    name: "Mantle Sepolia",
    chain: mantleTestnet,
    chainString: "mantleSepolia",
    rpcUrl: "https://mantle-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://explorer.sepolia.mantle.xyz",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/mantle.svg",
    chainIdHex: "0x138b",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  opBNBTestnet: {
    id: "opBNBTestnet",
    name: "opBNB Testnet",
    chain: opBNBTestnet,
    chainString: "opbnbTestnet",
    rpcUrl: "https://opbnb-testnet.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://testnet.opbnbscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/refs/heads/master/logo/opbnb.png",
    chainIdHex: "0x15eb",
    layer: "L2",
    parentChain: "bsc",
    isTestnet: true
  },
  scrollSepolia: {
    id: "scrollSepolia",
    name: "Scroll Sepolia",
    chain: scrollSepolia,
    chainString: "scrollSepolia",
    rpcUrl: "https://scroll-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.scrollscan.com",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/e00ec9bd4978a54ce1fb47e0583c9c4f7b0af8ff/logo/scroll.svg",
    chainIdHex: "0x8274f",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
  unichainSepolia: {
    id: "unichainSepolia",
    name: "UniChain Sepolia",
    chain: unichainSepolia,
    chainString: "unichainSepolia",
    rpcUrl: "https://unichain-sepolia.infura.io/v3/",
    coinId: "ethereum",
    blockExplorerUrl: "https://sepolia.explorer.unichain.network",
    logoUrl: "https://raw.githubusercontent.com/hellodevaigent/chain-support/refs/heads/master/logo/unichain.png",
    chainIdHex: "0x515",
    layer: "L2",
    parentChain: "ethereum",
    isTestnet: true
  },
});

// Default chain
export let currentChain: ChainConfig = SUPPORTED_CHAINS["ethereum"];

export function setChain(chainString: string) {
  const chain = SUPPORTED_CHAINS[chainString];

  if (!chain) {
    throw new Error(
      `Chain not supported: ${chainString}. Supported chains: ${Object.keys(
        SUPPORTED_CHAINS
      ).join(", ")}`
    );
  }

  currentChain = chain;
  return chain;
}

export function getCurrentChain(): ChainConfig {
  return currentChain;
}

/**
 * Array of keywords that indicate a chain is a testnet.
 * Defined as a constant for easy maintenance.
 */
const TESTNET_KEYWORDS = ["testnet", "sepolia", "fuji", "alfajores", "amoy"];

/**
 * Retrieves the supported chain configuration based on the chainKey.
 * @param chainKey - The key of the chain (e.g., 'eth', 'bsc').
 * @returns The chain configuration object if found, otherwise null.
 */
export const getSupportChain = (chainKey: string): ChainConfig | null => {
  return SUPPORTED_CHAINS[chainKey] || null;
};

/**
 * Checks whether a given chain is a testnet based on its configuration.
 * @param chain - The chain configuration object.
 * @returns `true` if the chain is a testnet, otherwise `false`.
 */
export const isTestnetChain = (chain: ChainConfig | null): boolean => {
  if (!chain) {
    return false;
  }

  const nameLower = chain.name.toLowerCase();
  return TESTNET_KEYWORDS.some(keyword => nameLower.includes(keyword));
};

/**
 * Helper function to directly check if a given chainKey refers to a testnet.
 * @param chainKey - The key of the chain (e.g., 'eth', 'sepolia').
 * @returns `true` if the chain is a testnet, otherwise `false`.
 */
export const isTestnetByKey = (chainKey: string): boolean => {
  const chain = getSupportChain(chainKey);
  return isTestnetChain(chain);
};
