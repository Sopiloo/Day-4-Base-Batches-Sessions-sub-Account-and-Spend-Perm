import {useEffect, useState} from "react";
import {createBaseAccountSDK} from "@base-org/account";
import {baseSepolia} from "viem/chains";
import {parseEther} from "viem";

const BACKEND_WALLET = import.meta.env.VITE_BACKEND_WALLET_ADDRESS;
const TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export default function App() {
	const [connected, setConnected] = useState("");
	const [account, setAccount] = useState("");
	const [sdk, setSdk] = useState(null);
	const [provider, setProvider] = useState(null);
	const [loading, setLoading] = useState(false);
	const [permission, setPermission] = useState(null);
	const [allowance, setAllowance] = useState('0.00009');

	const handleConnect = async () => {
		if (!provider || !sdk) {
			alert("SDK not initialized");
			return;
		}

		setLoading(true);
		try {
			await provider.request({method: "wallet_connect"});

			const accounts = await provider.request({
				method: "eth_requestAccounts",
			});

			// Switch to Base Sepolia if not already on it
			await provider.request({
				method: "wallet_switchEthereumChain",
				params: [{chainId: `0x${baseSepolia.id.toString(16)}`}],
			});
			

			setAccount(accounts[0]);
			setConnected(true);
			console.log("Connected to account:", accounts[0]);
		} catch (error) {
			console.error("Error connecting to wallet:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreatePermission = async () => {
		if (!BACKEND_WALLET) {
			alert("Please set the spender address!");
			return;
		}

		setLoading(true);

		try {
			const permission = {
				account,
				spender: BACKEND_WALLET,
				token: TOKEN_ADDRESS,
				allowance: parseEther(allowance).toString(),
				period: 2592000, // 30 days in seconds
				start: Math.floor(Date.now() / 1000),
				end: 281474976710655, // max uint48
				salt: `0x${Math.random().toString(16).slice(2)}${Math.random()
					.toString(16)
					.slice(2)}`,
				extraData: "0x",
			};

			const domain = {
				name: "Spend Permission Manager",
				version: "1",
				chainId: baseSepolia.id,
				verifyingContract: "0xf85210B21cC50302F477BA56686d2019dC9b67Ad",
			};

			const types = {
				SpendPermission: [
					{name: "account", type: "address"},
					{name: "spender", type: "address"},
					{name: "token", type: "address"},
					{name: "allowance", type: "uint160"},
					{name: "period", type: "uint48"},
					{name: "start", type: "uint48"},
					{name: "end", type: "uint48"},
					{name: "salt", type: "uint256"},
					{name: "extraData", type: "bytes"},
				],
			};

			const signature = await provider.request({
				method: "eth_signTypedData_v4",
				params: [
					account,
					JSON.stringify({
						types,
						domain,
						primaryType: "SpendPermission",
						message: permission,
					}),
				],
			});

			const newPermission = {
				permission,
				signature,
			};

			setPermission(newPermission);
			console.log('================================')
			console.log("SPEND PERMISSION CREATED")
			console.log('================================')
			console.log('\n COPY THIS TO BACKEND SCRIPT: \n')
			console.log('// Permission Object:')
			console.log(JSON.stringify(permission, null, 2))
			console.log('// Signature:')
			console.log(`"${newPermission.signature}"`)
			console.log('\n================================')
			
		} catch (error) {
			console.error("Error creating permission:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const initSdk = () => {
			try {
				const baseSdk = createBaseAccountSDK({
					appName: "Base Spend Permission Demo",
					appChainIds: [baseSepolia.id],
				});

				setSdk(baseSdk);
				setProvider(baseSdk.getProvider());
				console.log("SDK initialized", baseSdk);
			} catch (error) {
				console.error("Error initializing SDK", error);
			}
		};
		initSdk();
	}, []);
	return (
		<div>
			<div>
				<h1>Spend Permission Demo</h1>
				<p>Create a spend permission for the backend wallet</p>

				{!connected ? (
					<button onClick={handleConnect} disabled={loading}>
						{loading ? "Connecting..." : "Connect Wallet"}
					</button>
				) : (
					<div>
						<div>
							<p>Your address</p>
							<p>
								{account.slice(0, 6)}...{account.slice(-4)}
							</p>
						</div>
						<div>
							<p>Backend Wallet (Spender)</p>
							<p>
								{BACKEND_WALLET?.slice(0, 6)}...
								{BACKEND_WALLET?.slice(-4)}
							</p>
						</div>
						<div>
							<label htmlFor="">
								Allowance (ETH per 30 days)
							</label>
							<input
								type="number"
								value={allowance || '0.00009'}
								onChange={(e) => setAllowance(e.target.value)}
								disabled={loading || permission}
								step="0.001"
							/>
						</div>

						<button
							onClick={handleCreatePermission}
							disabled={loading || permission}
						>
							{permission
								? "Permission Created"
								: loading
								? "Creating..."
								: "Create Permission"}
						</button>

						{permission && (
							<div>
								<p>Permission Created Successfully</p>
								<div>
									<div>
										<span>User:</span>
										<span>
											{permission.permission.account}
										</span>
									</div>
									<div>
										<span>Spender:</span>
										<span>
											{permission.permission.spender}
										</span>
									</div>
									<div>
										<span>Allowance</span>
										<span>{allowance} ETH / 30 days</span>
									</div>
								</div>
								<div>
									<p>Next Steps:</p>
									<ol>
											<li>Open Browser console (F12)</li>
											<li>Copy permission object and signature</li>
											<li>Paste into <code>backend/approvePermission.js</code></li>
											<li>Run: <code>npm run approve</code></li>
											<li>Then run: <code>npm run spend</code></li>
									</ol>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}