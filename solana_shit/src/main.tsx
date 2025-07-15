import React from "react";
import ReactDOM from "react-dom/client";
import TxCodec from "./SolanaTxCodec";
import SingleWalletApp from "./SingleWalletApp";
import SolanaOnboardingApp from "./SolanaOnboardingApp";
// import SolanaSenderPhantom fro./SendSoltom";
import SendSol from "./SendSol";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SingleWalletApp />
    <SolanaOnboardingApp />
    <SendSol />
    <TxCodec />

  </React.StrictMode>
);