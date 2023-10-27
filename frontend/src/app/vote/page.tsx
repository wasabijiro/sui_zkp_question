"use client";

import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import React, { useEffect, useState } from "react";
import {
  createVoteObject,
  movecallVoteA,
  movecallVoteB,
} from "@/libs/movecall";
import { usePasscodeStore, useVerifierInputsStore } from "@/libs/store";
import { TransactionBlock } from "@mysten/sui.js";
import { VerifierInputs } from "@/types";
import { PACKAGE_ID } from "@/config/sui";

export default function Home() {
  const { signAndExecuteTransactionBlock } = useWallet();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [digest, setDigest] = useState("");
  const [objectId, setObjectId] = useState("");

  const getObjectId = (data: any, desiredObjectType: string): string | null => {
    for (const change of data.objectChanges) {
      if (change.objectType === desiredObjectType) {
        return change.objectId;
      }
    }
    return null;
  };

  const exctuteCreateObj = async () => {
    setMessage("");
    setLoading(true);
    setMessage("Loading...");
    try {
      const txb = new TransactionBlock();
      createVoteObject({ txb });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      const targetType = `${PACKAGE_ID}::vote::Vote`;
      console.log(result.effects.status);
      const objectId = getObjectId(result, targetType);
      console.log({ objectId });
      if (objectId !== null) {
        setObjectId(objectId as string);
      }
      setMessage("Shared Object Created!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      const obj_url = `https://suiexplorer.com/object/${objectId}?module=vote&network=testnet`;
      console.log(obj_url);
      setDigest(result.digest);
      setUrl(url);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint Failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const exctuteVoteA = async () => {
    setMessage("");
    setLoading(true);
    setMessage("Loading...");
    if (!objectId) {
      return;
    }
    try {
      const txb = new TransactionBlock();
      movecallVoteA({
        txb,
        vote_obj: objectId,
      });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      console.log(result.effects.status);
      setMessage("A Voted!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      setDigest(result.digest);
      setUrl(url);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint Failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const exctuteVoteB = async () => {
    setMessage("");
    setLoading(true);
    setMessage("Loading...");
    if (!objectId) {
      return;
    }
    try {
      const txb = new TransactionBlock();
      movecallVoteB({
        txb,
        vote_obj: objectId,
      });
      const result: any = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log({ result });
      console.log(result.effects.status);
      setMessage("A Voted!");
      const url = `https://suiexplorer.com/txblock/${result.digest}?network=testnet`;
      console.log(url);
      setDigest(result.digest);
      setUrl(url);
    } catch (err) {
      console.log("err:", err);
      setMessage(`Mint Failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center p-4">
      <header className="mb-10 flex justify-end items-start">
        <ConnectButton />
      </header>
      <button onClick={exctuteCreateObj} disabled={loading} className="">
        Create
      </button>
      <div className="">
        <button onClick={exctuteVoteA} disabled={loading} className="">
          Vote A
        </button>
        <button onClick={exctuteVoteB} disabled={loading} className="">
          Vote B
        </button>
      </div>
      <div className="mt-4">
        {message}
        {message !== "" && (
          <div className="mt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {digest}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
