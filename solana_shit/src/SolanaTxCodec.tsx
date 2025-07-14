import React, { useState } from "react";
import { Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";

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
  transition: "box-shadow 0.2s, background 0.2s",
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
  marginLeft: 8,
  padding: "8px 12px",
  background: "#fff",
  color: "#000",
  border: "2px solid #000",
  borderRadius: 0,
  cursor: "pointer",
  fontSize: 10,
};

const TxCodec = () => {
  // Encode
  const [txJson, setTxJson] = useState("");
  const [encoded, setEncoded] = useState("");
  const [encodeError, setEncodeError] = useState("");
  // Decode
  const [txBase64, setTxBase64] = useState("");
  const [decoded, setDecoded] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const handleEncode = () => {
    setEncodeError("");
    setEncoded("");
    try {
      const txObj = JSON.parse(txJson);
      const tx = Transaction.from(txObj);
      const base64 = Buffer.from(tx.serialize()).toString("base64");
      setEncoded(base64);
    } catch (e: any) {
      setEncodeError(e.message || "Invalid transaction JSON");
    }
  };

  const handleDecode = () => {
    setDecodeError("");
    setDecoded("");
    try {
      const buf = Buffer.from(txBase64, "base64");
      const tx = Transaction.from(buf);
      setDecoded(JSON.stringify(tx, null, 2));
    } catch (e: any) {
      setDecodeError(e.message || "Invalid base64 transaction");
    }
  };

  return (
    <div style={pixelStyle}>
      <h1 style={{ fontSize: 18, marginBottom: 24 }}>Solana Tx Encoder/Decoder</h1>
      {/* Encode Section */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 12, margin: "12px 0" }}>Encode Transaction (JSON → Base64)</h2>
        <textarea
          style={inputStyle}
          rows={6}
          placeholder="Paste transaction JSON here..."
          value={txJson}
          onChange={e => setTxJson(e.target.value)}
        />
        <br />
        <button style={buttonStyle} onClick={handleEncode}>Encode</button>
        {encodeError && <div style={{ color: "#ff5555", fontSize: 10, margin: "8px 0" }}>{encodeError}</div>}
        {encoded && (
          <div style={{
            wordBreak: "break-all",
            fontSize: 9,
            background: "#000",
            color: "#fff",
            padding: "8px",
            borderRadius: 0,
            margin: "8px 0",
            border: "1px dashed #fff",
            overflowWrap: "break-word",
            maxWidth: "100%",
            display: "inline-block",
          }}>
            <b>Base64:</b> {encoded}
          </div>
        )}
      </div>
      {/* Decode Section */}
      <div>
        <h2 style={{ fontSize: 12, margin: "12px 0" }}>Decode Transaction (Base64 → JSON)</h2>
        <textarea
          style={inputStyle}
          rows={3}
          placeholder="Paste base64 transaction here..."
          value={txBase64}
          onChange={e => setTxBase64(e.target.value)}
        />
        <br />
        <button style={buttonStyle} onClick={handleDecode}>Decode</button>
        {decodeError && <div style={{ color: "#ff5555", fontSize: 10, margin: "8px 0" }}>{decodeError}</div>}
        {decoded && (
          <pre style={{
            fontSize: 9,
            background: "#000",
            color: "#fff",
            padding: "8px",
            borderRadius: 0,
            margin: "8px 0",
            border: "1px dashed #fff",
            overflowWrap: "break-word",
            maxWidth: "100%",
            display: "inline-block",
            textAlign: "left"
          }}>{decoded}</pre>
        )}
      </div>
    </div>
  );
};

export default TxCodec; 