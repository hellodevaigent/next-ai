import { z } from "zod"

// Tool untuk mendapatkan cuaca
export const weatherTool = {
  description: "Get the current weather for a specific location",
  parameters: z.object({
    location: z
      .string()
      .describe("The city and state, e.g., San Francisco, CA"),
  }),
  execute: async ({ location }: { location: string }) => {
    const weatherData = {
      location,
      temperature: Math.floor(Math.random() * 35),
      conditions: ["Sunny", "Cloudy", "Rainy"][Math.floor(Math.random() * 3)],
    }

    return {
      ...weatherData,
      formatted: `The weather in ${weatherData.location} is currently ${weatherData.temperature}°C and ${weatherData.conditions}.`,
    }
  },
}

// Tool untuk kalkulator
export const calculatorTool = {
  description: "A simple calculator to perform arithmetic operations.",
  parameters: z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("The operation to perform."),
    a: z.number().describe("The first number."),
    b: z.number().describe("The second number."),
  }),
  execute: async ({
    operation,
    a,
    b,
  }: {
    operation: "add" | "subtract" | "multiply" | "divide"
    a: number
    b: number
  }) => {
    let result: number | string
    switch (operation) {
      case "add":
        result = a + b
        break
      case "subtract":
        result = a - b
        break
      case "multiply":
        result = a * b
        break
      case "divide":
        if (b === 0) {
          return { error: "Cannot divide by zero" }
        }
        result = a / b
        break
      default:
        return { error: "Invalid operation" }
    }
    return { result }
  },
}

export const contractAbiTool = {
  description: "Get the ABI for a given smart contract address.",
  parameters: z.object({
    contract: z.string().describe("The contract address, e.g., 0x..."),
  }),
  execute: async ({ contract }: { contract: `0x${string}` }) => {
    const GATEWAY_ENDPOINT = "http://localhost:5002/graphql"
    const GET_CONTRACT_ABI = `
      query GetContreactABI($address: String!) {
        getContreactABI(address: $address) {
          address
          chain
          chainId
          result
        }
      }
    `

    try {
      const response = await fetch(GATEWAY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_CONTRACT_ABI,
          variables: { address: contract },
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Network response was not ok, status: ${response.status}`
        )
      }

      const data = await response.json()
      const responseData = data?.data?.getContreactABI

      if (!responseData || !responseData.result) {
        return {
          error: "No contract ABI data found for the given address.",
          formatted: "No contract ABI data found for the given address.",
        }
      }

      return {
        abi: responseData,
        formatted: `Contract ABI: ${JSON.stringify(responseData, null, 2)}`,
      }
    } catch (error: any) {
      return {
        error: error.message || "Unknown error occurred",
        formatted: `${error.message || "Unknown error occurred"}`,
      }
    }
  },
}

async function searchToken(query: string) {
  const GATEWAY_ENDPOINT = "http://localhost:5002/graphql"
  const SEARCH_ERC20_TOKEN = `
    query SearchToken($query: String!) {
      searchToken(query: $query) {
        result
      }
    }
  `
  try {
    const response = await fetch(GATEWAY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: SEARCH_ERC20_TOKEN,
        variables: { query },
      }),
    })
    const data = await response.json()
    const result = data?.data?.searchToken?.result
    return result && result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error searching token:", error)
    return null
  }
}

export const erc20TokenTool = {
  description: "Get information about an ERC20 token by its name or address.",
  parameters: z.object({
    tokenName: z
      .string()
      .optional()
      .describe('The name of the token, e.g., "Uniswap".'),
    tokenAddress: z
      .string()
      .optional()
      .describe("The contract address of the token."),
    chainKey: z
      .string()
      .optional()
      .describe('The key of the chain, e.g., "eth-mainnet".'),
  }),
  execute: async ({
    tokenName,
    tokenAddress,
    chainKey,
  }: {
    tokenName?: string
    tokenAddress?: `0x${string}`
    chainKey?: string
  }) => {
    const GATEWAY_ENDPOINT = "http://localhost:5002/graphql"
    const GET_TOKEN_DATA = `
      query EvmERC20ByAddress($tokenAddress: String!, $chainKey: String) {
        evmERC20ByAddress(tokenAddress: $tokenAddress, chainKey: $chainKey) {
          result { name symbol totalSupply chain address logo price decimals marketCap securityScore tokenAgeInDays usdPrice24hrUsdChange usdPrice24hrPercentChange projectUrl }
        }
      }
    `

    try {
      let finalTokenAddress = tokenAddress

      if (!finalTokenAddress && tokenName) {
        const searchResult = await searchToken(tokenName)
        if (searchResult) {
          finalTokenAddress = searchResult.tokenAddress
        } else {
          return { error: `No token found for query: ${tokenName}` }
        }
      }

      if (!finalTokenAddress) {
        return { error: "Please provide either a token name or address." }
      }

      const response = await fetch(GATEWAY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: GET_TOKEN_DATA,
          variables: { tokenAddress: finalTokenAddress, chainKey },
        }),
      })

      const data = await response.json()
      const result = data?.data?.evmERC20ByAddress?.result

      if (!result) {
        return {
          error: `No token data found for address: ${finalTokenAddress}`,
        }
      }

      return { data: result }
    } catch (error: any) {
      return { error: error.message || "An unknown error occurred" }
    }
  },
}

// Gabungkan semua tools ke dalam satu objek untuk di-ekspor
export const toolFunctions = {
  weather: weatherTool,
  calculator: calculatorTool,
  getContractAbi: contractAbiTool,
  getTokenInfo: erc20TokenTool,
  // Tambahkan tools lain di sini
}
