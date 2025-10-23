import { createWalletClient, http, publicActions, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { baseSepolia } from "viem/chains"
import dotenv from "dotenv"

dotenv.config()

const account = privateKeyToAccount(process.env.PRIVATE_KEY)
const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.RPC_URL),
}).extend(publicActions)

const SPEND_PERMISSION_MANAGER = process.env.SPEND_PERMISSION_MANAGER

// ABI for the SpendPermissionManager contract
const approve_abi = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "account", "type": "address" },
          { "internalType": "address", "name": "spender", "type": "address" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "uint256", "name": "allowance", "type": "uint256" },
          { "internalType": "uint256", "name": "period", "type": "uint256" },
          { "internalType": "uint256", "name": "start", "type": "uint256" },
          { "internalType": "uint256", "name": "end", "type": "uint256" },
          { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
          { "internalType": "bytes", "name": "extraData", "type": "bytes" }
        ],
        "internalType": "struct ISpendPermissionManager.Permission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "approveWithSignature",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "account", "type": "address" },
          { "internalType": "address", "name": "spender", "type": "address" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "uint256", "name": "allowance", "type": "uint256" },
          { "internalType": "uint256", "name": "period", "type": "uint256" },
          { "internalType": "uint256", "name": "start", "type": "uint256" },
          { "internalType": "uint256", "name": "end", "type": "uint256" },
          { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
          { "internalType": "bytes", "name": "extraData", "type": "bytes" }
        ],
        "internalType": "struct ISpendPermissionManager.Permission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "approveWithSignature",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "stateMutability": "nonpayable"
  }
]

// Format salt as a 32-byte hex string (64 hex characters)
const salt = '0x' + '89780b1282dad87ae197fa5d0408'.padEnd(64, '0');

// Permission object with proper formatting
const permission = {
    account: "0xb0640C4B5380b897747eb6812378a31afe84Ce80",
    spender: "0x37B2Ce02cEfb748531A17B1929b60064883E2569",
    token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    allowance: 90000000000000n, // Using BigInt for large numbers
    period: 2592000,
    start: 1761221758,
    end: 281474976710655n, // Using BigInt for large numbers
    salt: salt,
    extraData: "0x"
};

// The signature should be a hex string without the 0x prefix for the actual signature part
const signature = "0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000017000000000000000000000000000000000000000000000000000000000000000114255a91d936466ad50a7b6256eef768c86accc7d9becfee8de1439d3f73775322d4fbb72b0c2cc87054573a0d48574759ee8c86834869657d058565ae529f4d0000000000000000000000000000000000000000000000000000000000000025f198086b2db17256731bc456673b96bcef23f51d1fbacdd7c4379ef65465572f1d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2269525a54334f53467372766d4235566868676665454a32425f4173584e74426d653330366675726b6d7463222c226f726967696e223a2268747470733a2f2f6b6579732e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000";

const spend_abi = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "account", "type": "address" },
          { "internalType": "address", "name": "spender", "type": "address" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "uint256", "name": "allowance", "type": "uint256" },
          { "internalType": "uint256", "name": "period", "type": "uint256" },
          { "internalType": "uint256", "name": "start", "type": "uint256" },
          { "internalType": "uint256", "name": "end", "type": "uint256" },
          { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
          { "internalType": "bytes", "name": "extraData", "type": "bytes" }
        ],
        "internalType": "struct ISpendPermissionManager.Permission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "spend",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function spend() {
    try {
        console.log('Preparing to spend...');
        const amount = parseEther('0.01');
        console.log('Amount to spend:', amount.toString());
        
        const hash = await client.writeContract({
            address: SPEND_PERMISSION_MANAGER,
            abi: spend_abi,
            functionName: 'spend',
            args: [permission, amount],
            gas: 300000, // Explicit gas limit
            maxFeePerGas: 1000000000n, // 1 gwei
            maxPriorityFeePerGas: 1000000000n, // 1 gwei
        });
        
        console.log('Transaction hash:', hash);
        console.log('Waiting for confirmation...');
        
        const receipt = await client.waitForTransactionReceipt({ hash });
        console.log('Transaction confirmed in block:', receipt.blockNumber.toString());
        return receipt;
    } catch (error) {
        console.error('Error in spend function:', {
            message: error.message,
            code: error.code,
            data: error.data,
            stack: error.stack
        });
        throw error;
    }
}
/* async function main() {
    try {
        console.log('Sending transaction...');
        const hash = await client.writeContract({
            address: SPEND_PERMISSION_MANAGER,
            abi,
            functionName: 'approveWithSignature',
            args: [permission, `0x${signature}`], // Add 0x prefix to signature
            gas: 300000, // Explicit gas limit
            maxFeePerGas: 1000000000n, // 1 gwei
            maxPriorityFeePerGas: 1000000000n, // 1 gwei
        });
        console.log('Transaction hash:', hash);
        console.log('Waiting for confirmation...')

        const receipt = await client.waitForTransactionReceipt({ hash })
        console.log('Confirmed in Block:', receipt.blockNumber.toString())
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            data: error.data,
            stack: error.stack
        });
        throw error; // Re-throw to see full error in console
    }
} */

// main().catch(console.error)

spend().catch(console.error)
