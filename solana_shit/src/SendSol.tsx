// import React, { useState } from "react";
// import {
//   Connection,
//   PublicKey,
//   SystemProgram,
//   Transaction,
//   clusterApiUrl,
// } from "@solana/web3.js";

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
// };

// const inputStyle = {
//   fontFamily: "'Press Start 2P', cursive",
//   padding: "8px",
//   border: "1px solid #fff",
//   borderRadius: 0,
//   width: "90%",
//   background: "#222",
//   color: "#fff",
//   fontSize: 10,
//   marginBottom: 8,
// };

// const buttonStyle = {
//   fontFamily: "'Press Start 2P', cursive",
//   marginLeft: 8,
//   padding: "8px 12px",
//   background: "#fff",
//   color: "#000",
//   border: "2px solid #000",
//   borderRadius: 0,
//   cursor: "pointer",
//   fontSize: 10,
// };

// const SolanaSenderPhantom = () => {
//   const [recipient, setRecipient] = useState("");
//   const [status, setStatus] = useState("");
//   const [signature, setSignature] = useState("");
//   const [connected, setConnected] = useState(false);
//   const [error, setError] = useState("");

//   const connectWallet = async () => {
//     setError("");
//     try {
//       if (!window.solana?.isPhantom) {
//         throw new Error("Phantom Wallet not installed");
//       }

//       const res = await window.solana.connect();
//       setConnected(true);
//       setStatus(`Connected as ${res.publicKey.toString()}`);
//     } catch (err: any) {
//       setError(err.message || "Failed to connect to wallet");
//     }
//   };

//   const sendTransaction = async () => {
//     setError("");
//     setSignature("");
//     setStatus("Sending...");

//     try {
//       const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

//       const sender = window.solana.publicKey;
//       const recipientPubkey = new PublicKey(recipient);

//       const transaction = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: sender,
//           toPubkey: recipientPubkey,
//           lamports: 0.01 * 1_000_000_000, // 0.01 SOL
//         })
//       );

//       transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//       transaction.feePayer = sender;

//       const signedTx = await window.solana.signTransaction(transaction);
//       const txid = await connection.sendRawTransaction(signedTx.serialize());

//       await connection.confirmTransaction(txid, "confirmed");

//       setSignature(txid);
//       setStatus("Transaction successful!");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Transaction failed");
//       setStatus("");
//     }
//   };

//   return (
//     <div style={pixelStyle}>
//       <h1 style={{ fontSize: 16, marginBottom: 24 }}>Send SOL with Phantom</h1>

//       {!connected ? (
//         <button style={buttonStyle} onClick={connectWallet}>
//           Connect Phantom
//         </button>
//       ) : (
//         <>
//           <input
//             style={inputStyle}
//             type="text"
//             placeholder="Recipient Address"
//             value={recipient}
//             onChange={(e) => setRecipient(e.target.value)}
//           />
//           <br />
//           <button style={buttonStyle} onClick={sendTransaction}>
//             Send 0.01 SOL
//           </button>
//         </>
//       )}

//       {status && <div style={{ color: "#0f0", fontSize: 10, marginTop: 12 }}>{status}</div>}
//       {signature && (
//         <div
//           style={{
//             color: "#fff",
//             fontSize: 9,
//             background: "#000",
//             padding: "8px",
//             border: "1px dashed #fff",
//             marginTop: 8,
//             wordBreak: "break-word",
//           }}
//         >
//           <b>Signature:</b> {signature}
//         </div>
//       )}
//       {error && <div style={{ color: "#f55", fontSize: 10, marginTop: 12 }}>{error}</div>}
//     </div>
//   );
// };

// export default SolanaSenderPhantom;
import React, { useState } from "react";
import {
  airdropFactory,
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

// === Styles ===
const pixelStyle = {
  fontFamily: "'Press Start 2P', cursive",
  backgroundColor: "#111",
  color: "#fff",
  border: "2px solid #fff",
  padding: "32px 24px",
  borderRadius: "18px",
  boxShadow: "0 4px 32px rgba(255,255,255,0.15)",
  maxWidth: 520,
  margin: "40px auto",
  textAlign: "center" as const,
};

const inputStyle = {
  fontFamily: "'Press Start 2P', cursive",
  padding: "8px",
  border: "1px solid #fff",
  borderRadius: 0,
  width: "90%",
  background: "#222",
  color: "#fff",
  fontSize: 10,
  marginBottom: 8,
};

const buttonStyle = {
  fontFamily: "'Press Start 2P', cursive",
  marginTop: 8,
  padding: "8px 12px",
  background: "#fff",
  color: "#000",
  border: "2px solid #000",
  borderRadius: 0,
  cursor: "pointer",
  fontSize: 10,
};

const SendSol = () => {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");

  const handleSend = async () => {
    setStatus("sending");
    setTxSig(null);

    try {
      const rpc = createSolanaRpc("https://api.devnet.solana.com");
      const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

      const sender = await generateKeyPairSigner();
      const recipientAddress = recipient.trim();

      // Airdrop to sender
      await airdropFactory({ rpc, rpcSubscriptions })({
        recipientAddress: sender.address,
        lamports: lamports(1_000_000_000n),
        commitment: "confirmed",
      });

      const transferInstruction = getTransferSolInstruction({
        source: sender,
        destination: recipientAddress,
        amount: lamports(100_000_000n), // 0.1 SOL
      });

      const { value: { blockhash, lastValidBlockHeight } } = await rpc.getLatestBlockhash().send();

      const txMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayerSigner(sender, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash({ blockhash, lastValidBlockHeight }, tx),
        (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
      );

      const signedTx = await signTransactionMessageWithSigners(txMessage, [sender]);

      const signature = getSignatureFromTransaction(signedTx);

      await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
        signedTx,
        {
          commitment: "confirmed",
        }
      );

      setStatus("success");
      setTxSig(signature);
    } catch (err) {
      console.error("Transaction failed:", err);
      setStatus("error");
    }
  };

  return (
    <div style={pixelStyle}>
      <h2 style={{ fontSize: 12, marginBottom: 16 }}>Send SOL (Devnet)</h2>
      <input
        style={inputStyle}
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <br />
      <button style={buttonStyle} onClick={handleSend}>Send 0.1 SOL</button>

      {status === "sending" && (
        <p style={{ color: "yellow", marginTop: 12, fontSize: 10 }}>⏳ Sending...</p>
      )}
      {status === "success" && txSig && (
        <p style={{ color: "lightgreen", marginTop: 12, fontSize: 10 }}>
          ✅ Success!<br />
          <a
            style={{ color: "#00ffff", textDecoration: "underline" }}
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        </p>
      )}
      {status === "error" && (
        <p style={{ color: "#ff5555", marginTop: 12, fontSize: 10 }}>
          ❌ Transaction Failed
        </p>
      )}
    </div>
  );
};

export default SendSol;
