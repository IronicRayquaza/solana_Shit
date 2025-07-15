// import React, { useState } from "react";
// import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";
// import { PublicKey } from "@solana/web3.js";
// import { MintLayout } from "@solana/spl-token";
// import { Buffer } from "buffer";
// import "@solana/wallet-adapter-react-ui/styles.css";

// const network = WalletAdapterNetwork.Devnet;
// const endpoint = "https://api.devnet.solana.com";
// const wallets = [new PhantomWalletAdapter()];

// const pixelStyle = {
//   fontFamily: "'Press Start 2P', cursive",
//   backgroundColor: "#111",
//   color: "#fff",
//   border: "2px solid #fff",
//   padding: "32px 24px",
//   borderRadius: "18px",
//   boxShadow: "0 4px 32px rgba(255,255,255,0.15)",
//   maxWidth: 520,
//   margin: "40px auto",
//   textAlign: "center" as const,
//   transition: "box-shadow 0.2s, background 0.2s",
// };

// function getPubkeyString(pk: any) {
//   if (!pk) return null;
//   if (typeof pk.toBase58 === 'function') return pk.toBase58();
//   try {
//     return new PublicKey(pk).toBase58();
//   } catch {
//     return null;
//   }
// }

// function decodeMintData(data: Buffer) {
//   try {
//     console.log('Raw Buffer Data:', data);
//     const mintInfo = MintLayout.decode(data);
//     console.log('Decoded Mint Info:', mintInfo);
//     return {
//       mintAuthority: mintInfo.mintAuthorityOption ? getPubkeyString(mintInfo.mintAuthority) : null,
//       supply: (() => {
//         const supplyBytes = new Uint8Array(mintInfo.supply as any);
//         let supply = BigInt(0);
//         for (let i = 0; i < supplyBytes.length; i++) {
//           supply += BigInt(supplyBytes[i]) << (BigInt(8) * BigInt(i));
//         }
//         return supply.toString();
//       })(),
//       decimals: mintInfo.decimals,
//       isInitialized: !!mintInfo.isInitialized,
//       freezeAuthority: mintInfo.freezeAuthorityOption ? getPubkeyString(mintInfo.freezeAuthority) : null,
//       _raw: mintInfo // Attach the full decoded object for debugging
//     };
//   } catch (e) {
//     return null;
//   }
// }

// const AccountDataFetcher = () => {
//   const { connection } = useConnection();
//   const [pubkeyInput, setPubkeyInput] = useState("");
//   const [accountData, setAccountData] = useState<string | null>(null);
//   const [decodedMint, setDecodedMint] = useState<any | null>(null);
//   const [decodeError, setDecodeError] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Log render state for debugging
//   console.log('render', { decodedMint, decodeError });

//   const fetchAccountData = async () => {
//     setError(null);
//     setAccountData(null);
//     setDecodedMint(null);
//     setDecodeError(null);
//     setLoading(true);
//     try {
//       const pubkey = new PublicKey(pubkeyInput);
//       const accInfo = await connection.getAccountInfo(pubkey);
//       if (!accInfo) {
//         setError("Account not found or no data.");
//       } else {
//         setAccountData(Buffer.from(accInfo.data).toString("hex"));
//         // Show data length for debugging
//         console.log('Account data length:', accInfo.data.length);
//         // Try to decode as SPL Token Mint if data length matches
//         if (accInfo.data.length === MintLayout.span) {
//           const dataBuffer = Buffer.from(accInfo.data);
//           const decoded = decodeMintData(dataBuffer);
//           console.log('decodeMintData returned:', decoded);
//           if (decoded) {
//             setDecodedMint(decoded);
//             setDecodeError(null);
//             console.log('setDecodedMint called with:', decoded);
//           } else {
//             setDecodedMint(null);
//             setDecodeError("SPL Token Mint decoding failed (data length matches, but layout did not decode).\nCheck if this is a valid SPL Token Mint account.");
//             console.log('setDecodeError called');
//           }
//         }
//       }
//     } catch (e: any) {
//       setError(e.message || "Invalid public key or network error.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div style={{ marginTop: 24 }}>
//       <div style={{ marginBottom: 12 }}>
//         <input
//           style={{
//             fontFamily: "'Press Start 2P', cursive",
//             padding: "8px",
//             border: "1px solid #fff",
//             borderRadius: 0,
//             width: "80%",
//             background: "#222",
//             color: "#fff",
//             fontSize: 10,
//           }}
//           type="text"
//           placeholder="Enter Solana public key..."
//           value={pubkeyInput}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPubkeyInput(e.target.value)}
//         />
//         <button
//           style={{
//             fontFamily: "'Press Start 2P', cursive",
//             marginLeft: 8,
//             padding: "8px 12px",
//             background: "#fff",
//             color: "#000",
//             border: "2px solid #000",
//             borderRadius: 0,
//             cursor: "pointer",
//             fontSize: 10,
//           }}
//           onClick={fetchAccountData}
//           disabled={loading || !pubkeyInput}
//         >
//           {loading ? "Loading..." : "Fetch"}
//         </button>
//       </div>
//       {error && (
//         <div style={{ color: "#ff5555", fontSize: 10, margin: "8px 0" }}>{error}</div>
//       )}
//       {accountData && (
//         <div
//           style={{
//             wordBreak: "break-all",
//             fontSize: 9,
//             background: "#000",
//             color: "#fff",
//             padding: "8px",
//             borderRadius: 0,
//             margin: "8px 0",
//             border: "1px dashed #fff",
//             overflowWrap: "break-word",
//             maxWidth: "100%",
//             display: "inline-block",
//           }}
//         >
//           <b>Account Data (hex):</b> {accountData}
//         </div>
//       )}
//       {/* Show decoded debug info directly below hex code, unconditionally for debugging */}
//       <div style={{
//         background: "#222",
//         color: "#fff",
//         border: "1px solid #fff",
//         borderRadius: 0,
//         padding: "12px 8px",
//         margin: "8px 0",
//         fontSize: 10,
//         textAlign: "left",
//         maxWidth: 400,
//         marginLeft: "auto",
//         marginRight: "auto"
//       }}>
//         <b>SPL Token Mint Decoded (Full Object):</b>
//         <pre style={{fontSize: 10, color: '#fff', background: '#111', padding: 4, border: '1px solid #444', overflowX: 'auto'}}>
//           {JSON.stringify(decodedMint, null, 2)}
//         </pre>
//       </div>
//     </div>
//   );
// };

// const SolanaProgramInteraction = () => (
//   <ConnectionProvider endpoint={endpoint}>
//     <WalletProvider wallets={wallets} autoConnect>
//       <WalletModalProvider>
//         <div style={pixelStyle}>
//           <h1 style={{ fontSize: 18, marginBottom: 24 }}>Solana Program Interaction</h1>
//           <WalletMultiButton style={{
//             fontFamily: "'Press Start 2P', cursive",
//             backgroundColor: "#fff",
//             color: "#000",
//             border: "2px solid #000",
//             padding: "8px 12px",
//             boxShadow: "0 0 10px #fff",
//             borderRadius: 0,
//             cursor: "pointer"
//           }} />
//           <AccountDataFetcher />
//           {/*
//             // Anchor integration placeholder:
//             // Here you could add a section to interact with an Anchor program using its IDL and @project-serum/anchor
//           */}
//         </div>
//       </WalletModalProvider>
//     </WalletProvider>
//   </ConnectionProvider>
// );

// export default SolanaProgramInteraction; 

import React, { useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Buffer } from "buffer";
import "@solana/wallet-adapter-react-ui/styles.css";

const network = "https://api.devnet.solana.com";
const wallets = [new PhantomWalletAdapter()];

const pixelStyle = {
  fontFamily: "'Press Start 2P', cursive",
  backgroundColor: "#111",
  color: "#fff",
  border: "2px solid #fff",
  padding: "32px 24px",
  borderRadius: "18px",
  boxShadow: "0 4px 32px rgba(255,255,255,0.15)",
  maxWidth: 620,
  margin: "40px auto",
  textAlign: "center" as const,
};

const OnboardingTools = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [mintPubkey, setMintPubkey] = useState<PublicKey | null>(null);
  const [tokenAccount, setTokenAccount] = useState<PublicKey | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((lamports) => setBalance(lamports / LAMPORTS_PER_SOL));
    }
  }, [publicKey, connection]);

  const requestAirdrop = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig);
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
      alert("Airdrop successful!");
    } catch (e) {
      alert("Airdrop failed: " + e);
    }
    setLoading(false);
  };

  const createTokenMint = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const mint = Keypair.generate();
      const lamports = await connection.getMinimumBalanceForRentExemption(82);
      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          lamports,
          space: 82,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mint.publicKey, 0, publicKey, null)
      );
      await sendTransaction(tx, connection, { signers: [mint] });
      setMintPubkey(mint.publicKey);
      alert("Token mint created: " + mint.publicKey.toBase58());
    } catch (e) {
      alert("Failed to create mint: " + e);
    }
    setLoading(false);
  };

  const createTokenAccount = async () => {
    if (!publicKey || !mintPubkey) return;
    setLoading(true);
    try {
      const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
      const ix = createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mintPubkey);
      const tx = new Transaction().add(ix);
      await sendTransaction(tx, connection);
      setTokenAccount(ata);
      alert("Associated Token Account created: " + ata.toBase58());
    } catch (e) {
      alert("Token account creation failed: " + e);
    }
    setLoading(false);
  };

  const mintTokens = async () => {
    if (!publicKey || !mintPubkey || !tokenAccount) return;
    setLoading(true);
    try {
      const ix = createMintToInstruction(mintPubkey, tokenAccount, publicKey, 100);
      const tx = new Transaction().add(ix);
      await sendTransaction(tx, connection);
      alert("Minted 100 tokens.");
    } catch (e) {
      alert("Minting failed: " + e);
    }
    setLoading(false);
  };

  const fetchTokenBalance = async () => {
    if (!tokenAccount) return;
    const acc = await connection.getTokenAccountBalance(tokenAccount);
    setTokenBalance(acc.value.uiAmountString);
  };

  return (
    <div style={pixelStyle}>
      <h2>🧪 Solana Onboarding Playground</h2>
      <WalletMultiButton style={{ marginBottom: 16 }} />
      {publicKey && (
        <>
          <div style={{ fontSize: 12 }}>Wallet: {publicKey.toBase58()}</div>
          <div style={{ marginBottom: 12 }}>Balance: {balance?.toFixed(2)} SOL</div>
          <button disabled={loading} onClick={requestAirdrop}>Request 1 SOL Airdrop</button>
          <hr style={{ margin: '24px 0', border: '1px dashed #fff' }} />
          <button disabled={loading} onClick={createTokenMint}>Create SPL Token Mint</button>
          {mintPubkey && <div style={{ fontSize: 10 }}>Mint Address: {mintPubkey.toBase58()}</div>}

          <button disabled={loading || !mintPubkey} onClick={createTokenAccount}>
            Create Token Account
          </button>
          {tokenAccount && <div style={{ fontSize: 10 }}>Token Account: {tokenAccount.toBase58()}</div>}

          <button disabled={loading || !tokenAccount} onClick={mintTokens}>Mint 100 Tokens</button>

          <button disabled={!tokenAccount} onClick={fetchTokenBalance}>Check Token Balance</button>
          {tokenBalance && <div>Token Balance: {tokenBalance}</div>}
        </>
      )}
    </div>
  );
};

const SolanaOnboardingApp = () => (
  <ConnectionProvider endpoint={network}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <OnboardingTools />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default SolanaOnboardingApp;
