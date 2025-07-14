// import React, { useEffect, useState } from "react";
// import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// const network = WalletAdapterNetwork.Devnet;
// const endpoint = "https://api.devnet.solana.com";
// const wallets = [new PhantomWalletAdapter()];

// const WalletInfo = () => {
//   const { publicKey } = useWallet();
//   const { connection } = useConnection();
//   const [balance, setBalance] = useState<number | null>(null);

//   useEffect(() => {
//     if (!publicKey) {
//       setBalance(null);
//       return;
//     }
//     connection.getBalance(publicKey).then((lamports: number) => {
//       setBalance(lamports / 1e9);
//     });
//   }, [publicKey, connection]);

//   if (!publicKey) return null;

//   return (
//     <div style={{ marginTop: 16 }}>
//       <div><b>Address:</b> {publicKey.toBase58()}</div>
//       <div><b>SOL Balance:</b> {balance !== null ? balance : "Loading..."} SOL</div>
//     </div>
//   );
// };

// const SingleWalletApp = () => (
//   <ConnectionProvider endpoint={endpoint}>
//     <WalletProvider wallets={wallets} autoConnect>
//       <WalletModalProvider>
//         <div style={{ maxWidth: 480, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
//           <h1>Solana Onboarding Demo</h1>
//           <WalletMultiButton />
//           <WalletInfo />
//         </div>
//       </WalletModalProvider>
//     </WalletProvider>
//   </ConnectionProvider>
// );

// export default SingleWalletApp; 

import React, { useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";

const network = WalletAdapterNetwork.Devnet;
const endpoint = "https://api.devnet.solana.com";
const wallets = [new PhantomWalletAdapter()];

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
  textAlign: "center",
  transition: "box-shadow 0.2s, background 0.2s",
};

const WalletInfo = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    connection.getBalance(publicKey).then((lamports: number) => {
      setBalance(lamports / 1e9);
    });
  }, [publicKey, connection]);

  if (!publicKey) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          wordBreak: "break-all",
          fontSize: 9,
          background: "#000",
          color: "#fff",
          padding: "8px",
          borderRadius: "0px",
          margin: "8px 0",
          border: "1px dashed #fff",
          overflowWrap: "break-word",
          maxWidth: "100%",
          display: "inline-block",
        }}
      >
        <b>Address:</b> {publicKey.toBase58()}
      </div>
      <div
        style={{
          wordBreak: "break-all",
          fontSize: 9,
          background: "#000",
          color: "#fff",
          padding: "8px",
          borderRadius: "0px",
          margin: "8px 0",
          border: "1px dashed #fff",
          overflowWrap: "break-word",
          maxWidth: "100%",
          display: "inline-block",
        }}
      >
        <b>SOL Balance:</b> {balance !== null ? balance : "Loading..."} SOL
      </div>
    </div>
  );
};

const SingleWalletApp = () => (
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <div style={pixelStyle}>
          <h1 style={{ fontSize: 18, marginBottom: 24 }}>Solana 8-Bit Wallet</h1>
          <WalletMultiButton style={{
            fontFamily: "'Press Start 2P', cursive",
            backgroundColor: "#fff",
            color: "#000",
            border: "2px solid #000",
            padding: "8px 12px",
            boxShadow: "0 0 10px #fff",
            borderRadius: "0px",
            cursor: "pointer"
          }} />
          <WalletInfo />
        </div>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default SingleWalletApp;
