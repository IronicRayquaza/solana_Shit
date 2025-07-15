import React, { useState } from 'react';
import { Connection, Transaction, VersionedTransaction, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Buffer = Buffer;
}

const SAMPLE_BASE64_TX =
  'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAFqQwQwQAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8='; // This is a dummy, replace with a real one if needed

const SolanaTransactionTool: React.FC = () => {
  const [rawTransaction, setRawTransaction] = useState<string>('');
  const [decodedTransaction, setDecodedTransaction] = useState<string>('');
  const [connection] = useState<Connection>(new Connection(clusterApiUrl('mainnet-beta')));
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const decodeTransaction = async () => {
    setError('');
    setLoading(true);

    try {
      if (!rawTransaction.trim()) {
        throw new Error('Please enter a transaction');
      }

      // Try decoding as base64 first (versioned transaction)
      try {
        const buffer = Buffer.from(rawTransaction, 'base64');
        // VersionedTransaction.deserialize throws if signatures mismatch
        const versionedTx = VersionedTransaction.deserialize(buffer);
        setDecodedTransaction(JSON.stringify(versionedTx, null, 2));
        setLoading(false);
        return;
      } catch (e: any) {
        if (
          e?.message?.includes('Expected signatures length to be equal to the number of required signatures')
        ) {
          setError(
            'VersionedTransaction Error: The transaction is missing required signatures. Make sure you sign the transaction before serializing.'
          );
          setLoading(false);
          return;
        }
        // console.log('VersionedTransaction error:', e);
      }

      // Try decoding as legacy transaction
      try {
        const buffer = Buffer.from(rawTransaction, 'base64');
        const legacyTx = Transaction.from(buffer);
        setDecodedTransaction(
          JSON.stringify(
            {
              signatures: legacyTx.signatures.map((sig) => ({
                publicKey: sig.publicKey.toString(),
                signature: sig.signature?.toString('base64') || null,
              })),
              recentBlockhash: legacyTx.recentBlockhash,
              feePayer: legacyTx.feePayer?.toString(),
              instructions: legacyTx.instructions.map((ix) => ({
                programId: ix.programId.toString(),
                keys: ix.keys.map((k) => ({
                  pubkey: k.pubkey.toString(),
                  isSigner: k.isSigner,
                  isWritable: k.isWritable,
                })),
                data: ix.data.toString('base64'),
              })),
            },
            null,
            2
          )
        );
        setLoading(false);
        return;
      } catch (e: any) {
        if (
          e?.message?.includes("Cannot read properties of undefined") ||
          e?.message?.includes("toJSON")
        ) {
          setError(
            'Legacy Transaction Error: The transaction data is malformed or missing required fields. Ensure you are using a valid, signed, base64-encoded Solana transaction.'
          );
          setLoading(false);
          return;
        }
        // console.log('Legacy Transaction error:', e);
      }

      throw new Error(
        "Could not decode transaction. Make sure it's a valid base64-encoded, signed Solana transaction. See the help section for instructions."
      );
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setDecodedTransaction('');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setRawTransaction('');
    setDecodedTransaction('');
    setError('');
  };

  const pasteSample = () => {
    setRawTransaction(SAMPLE_BASE64_TX);
    setDecodedTransaction('');
    setError('');
  };

  return (
    <div className="solana-transaction-tool">
      <h2>Solana Transaction Encoder/Decoder</h2>

      <button
        style={{ marginBottom: 10 }}
        onClick={() => setShowHelp((v) => !v)}
      >
        {showHelp ? 'Hide Help & Examples' : 'Show Help & Examples'}
      </button>
      {showHelp && (
        <div className="help-section" style={{ marginBottom: 20, background: '#f1f8ff', padding: 16, borderRadius: 6, border: '1px solid #b6d4fe' }}>
          <h3>How to Generate a Valid Solana Transaction (Base64)</h3>
          <p>
            <b>1. Sign the transaction before serializing.</b><br />
            <b>2. Use <code>tx.serialize()</code> and encode with base64.</b><br />
            <b>3. Paste the base64 string below.</b>
          </p>
          <pre style={{ background: '#e9ecef', padding: 10, borderRadius: 4 }}>
{`import {
  Connection, Keypair, VersionedTransaction, TransactionMessage, SystemProgram, PublicKey
} from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const payer = Keypair.generate(); // Replace with your actual signer
const recipient = new PublicKey('RecipientPublicKeyHere');

(async () => {
  const blockhash = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: [
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipient,
        lamports: 1000,
      }),
    ],
  }).compileToV0Message();
  const tx = new VersionedTransaction(message);
  tx.sign([payer]);
  const serialized = tx.serialize();
  const base64Tx = Buffer.from(serialized).toString('base64');
  console.log('Base64-encoded versioned tx:', base64Tx);
})();`}
          </pre>
          <p>
            <b>Sample base64 transaction (for demo):</b>
            <br />
            <code style={{ wordBreak: 'break-all', background: '#fff', padding: 4, borderRadius: 2 }}>{SAMPLE_BASE64_TX}</code>
          </p>
          <p>
            <b>Common errors:</b>
            <ul>
              <li><b>VersionedTransaction Error:</b> Missing required signatures. Sign the transaction before serializing.</li>
              <li><b>Legacy Transaction Error:</b> Malformed or incomplete transaction. Use a valid, signed transaction.</li>
            </ul>
          </p>
        </div>
      )}

      <div className="input-section">
        <label htmlFor="rawTransaction">Transaction (base64):</label>
        <textarea
          id="rawTransaction"
          value={rawTransaction}
          onChange={(e) => setRawTransaction(e.target.value)}
          placeholder="Paste base64-encoded transaction here"
          rows={5}
        />
      </div>

      <div className="button-group">
        <button onClick={decodeTransaction} disabled={loading}>
          {loading ? 'Decoding...' : 'Decode Transaction'}
        </button>
        <button onClick={clearAll}>Clear All</button>
        <button onClick={pasteSample} type="button">Paste Sample Transaction</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {decodedTransaction && (
        <div className="output-section">
          <label>Decoded Transaction:</label>
          <pre>{decodedTransaction}</pre>
        </div>
      )}

      <style>{`
        .solana-transaction-tool {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .input-section, .output-section {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        textarea, pre {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f9f9f9;
          font-family: monospace;
          overflow-x: auto;
        }
        pre {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .error-message {
          color: #dc3545;
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #dc3545;
          border-radius: 4px;
          background-color: #f8d7da;
        }
        .help-section code, .help-section pre {
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default SolanaTransactionTool;
