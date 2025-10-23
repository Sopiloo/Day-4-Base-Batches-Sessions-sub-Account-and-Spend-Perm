"use client"

import { useEffect, useState } from "react"
import { createBaseAccountSDK } from "@base-org/account"
import { baseSepolia } from "viem/chains"
import { encodeFunctionData, parseEther } from "viem"

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const FUND_AMOUNT = 0.00009

const FUNDME_ABI = [
  {
    inputs: [],
    name: "fundMe",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
]

export default function App() {
  const [connected, setConnected] = useState(false)
  const [universalAccount, setUniversalAccount] = useState("")
  const [subAccount, setSubAccount] = useState(null)
  const [status, setStatus] = useState("")
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdk = await createBaseAccountSDK({
          appName: "FundMe Demo",
          appChainId: [baseSepolia.id],
        })

        const providerInstance = sdk.getProvider()
        setProvider(providerInstance)
        setStatus("Ready to connect")
      } catch (error) {
        console.error("Error initializing Base Account SDK:", error)
        setStatus("SDK initialization failed")
      }
    }

    initializeSDK()
  }, [])

  const handleConnect = async () => {
    if (!provider) {
      setStatus("Provider not initialized")
      return
    }

    setLoading(true)
    setStatus("Connecting to base account")

    try {
      const account = await provider.request({
        method: "eth_requestAccounts",
        params: [],
      })

      const universalAddress = account[0]
      setUniversalAccount(universalAddress)

      setStatus("Checking for existing subaccounts")

      const response = await provider.request({
        method: "wallet_getSubAccounts",
        params: [
          {
            account: universalAccount,
            domain: window.location.origin,
          },
        ],
      })

      const existingSubAccount = response.subAccounts[0]

      if (existingSubAccount) {
        setSubAccount(existingSubAccount)
        setStatus("Connected! Sub Account Ready")
      } else {
        setStatus("Creating sub accounts")
        const newSubAccount = await provider.request({
          method: "wallet_addSubAccount",
          params: [
            {
              account: {
                type: "create",
              },
            },
          ],
        })

        setSubAccount(newSubAccount)
        setStatus("Connected! Sub account created and ready!")
      }

      setConnected(true)
    } catch (error) {
      console.error("Error during connection or subaccount handling:", error)
      setStatus(`Error: ${error?.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFund = async () => {
    setLoading(true)

    try {
      if (!provider || !subAccount) {
        throw new Error("Wallet or Subaccount not ready")
      }

      setStatus("Encoding contract call")

      const data = encodeFunctionData({
        abi: FUNDME_ABI,
        functionName: "fundMe",
        args: [],
      })

      const valueInWei = parseEther(FUND_AMOUNT.toString())
      const valueHex = `0x${valueInWei.toString(16)}`

      setStatus("Sending transaction from sub account")

      const callsId = await provider.request({
        method: "wallet_sendCalls",
        params: [
          {
            version: "2.0",
            from: subAccount.address,
            chainId: `0x${baseSepolia.id.toString(16)}`,
            calls: [
              {
                to: CONTRACT_ADDRESS,
                value: valueHex,
                data: data,
              },
            ],
          },
        ],
      })

      console.log(`Call ID : ${callsId}`)

      setStatus(`fund ${FUND_AMOUNT} from sub account`)
    } catch (error) {
      console.error("Error during funding:", error)
      setStatus(error?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* En-tête avec dégradé bleu */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Base Sepolia
          </h1>
          <p className="mt-4 text-lg text-blue-600 font-medium">Decentralized Funding Platform</p>
          <div className="mt-6 flex justify-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-100"></span>
            <span className="h-2 w-2 rounded-full bg-blue-300 animate-pulse delay-200"></span>
          </div>
        </header>

        {/* Carte principale */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-100 transform transition-all hover:shadow-2xl">
          {/* En-tête avec dégradé */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
            <h2 className="text-2xl font-bold">Fund Me DApp</h2>
            <p className="text-blue-100">Connect your wallet to get started</p>
          </div>

          <div className="p-6 md:p-8">
            {connected ? (
              <div className="space-y-6">
                {/* Section Compte Universel */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                      Universal Account
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                    <p className="font-mono text-sm text-blue-900 break-all">
                      {universalAccount}
                    </p>
                  </div>
                </div>

                {/* Section Sous-compte */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                        Subaccount (Smart Wallet)
                      </h3>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      FUNDING ACCOUNT
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm mb-4">
                    <p className="font-mono text-sm text-blue-900 break-all">
                      {subAccount ? subAccount.address : "Creating subaccount..."}
                    </p>
                  </div>
                  
                  {subAccount && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-400">
                      <div className="text-blue-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-700">
                        Make sure this subaccount has <span className="font-semibold text-blue-800">{FUND_AMOUNT} ETH</span> + gas fees on Base Sepolia
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-500 mb-6">Please connect your wallet to interact with the application</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              {!connected ? (
                <button
                  onClick={handleConnect}
                  disabled={loading || !provider}
                  className={`relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading || !provider 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl shadow-blue-500/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V3a1 1 0 011-1h7a1 1 0 01.707.293l7 7zM12 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Connect Wallet
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleFund}
                  disabled={loading}
                  className={`relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl shadow-blue-500/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        Fund Me
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Affichage du statut */}
            {status && (
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                      System Status
                    </p>
                    <p className="text-sm text-blue-800">{status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Pied de page */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
            <div className="flex items-center space-x-4 text-xs text-blue-600">
              <span className="flex items-center">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-blue-500"></span>
                BASE SEPOLIA TESTNET
              </span>
              <span className="h-4 w-px bg-blue-200"></span>
              <span className="flex items-center">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-medium">LIVE</span>
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-blue-400">
            Secured by Base Network
          </p>
        </footer>
      </div>
    </div>
  )
}