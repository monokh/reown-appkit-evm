"use client";
import { useAccount, useConnections, useSignMessage } from "wagmi";
import { useTelegram } from '../hooks/useTelegram';
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [ appLoaded, setAppLoaded ] = useState(false);
  const { isConnected, address, isConnecting } = useAccount();
  const [ messageToSign, setMessageToSign ] = useState<string | null>(null);
  const { signMessageAsync, isPending: signMessagePending } = useSignMessage();
  const connections = useConnections();

  const webApp = useTelegram();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const params = Array.from(urlParams.entries()).reduce((acc :{[key: string]: string}, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    if ("message" in params) {
      setMessageToSign(params.message);
    }

    setAppLoaded(true);
    
    console.log('Query parameters:', params);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      console.log('ADDRESS CONNECTED', address);
      // Send the address to the bot when connected
      console.log({webApp})
      if (webApp && appLoaded && !messageToSign) {
        setTimeout(() => {
          webApp.sendData(JSON.stringify({
            type: 'connection',
            data: {
              address: `${address}`
            }
          }));
          console.log('SENT ADDRESS')
        }, 5000);
      }
    }
  }, [address, isConnected, webApp, appLoaded, messageToSign]);

  useEffect(() => { 
    if (messageToSign && webApp && appLoaded && connections.length > 0) {
      signMessageAsync({
        account: address, message: messageToSign,
      }).then((signature) => {
         webApp.sendData(JSON.stringify({
            type: 'signature',
            data: {
              message: messageToSign,
              address,
              signature,
            }
          }));
          console.log('SENT SIGNATURE');
      });
    }
  }, [messageToSign, webApp, appLoaded, address, signMessageAsync, connections]);

  return (
    <main className="min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center">
      <header className="w-full py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/reown-logo.png" alt="logo" className="w-35 h-10 mr-2" />
          <div className="hidden sm:inline text-xl font-bold">Reown - AppKit EVM</div>
        </div>
      </header>
      <div className="max-w-4xl">
        { !signMessagePending && <div className="grid bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <h3 className="text-sm font-semibold bg-gray-100 p-2 text-center">Connect your wallet</h3>
          <div className="flex justify-center items-center p-4">
          <appkit-button />
          </div>
        </div>}
        <br></br>
        {isConnected && !signMessagePending && (
          <div className="grid bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <h3 className="text-sm font-semibold bg-gray-100 p-2 text-center">Network selection button</h3>
            <div className="flex justify-center items-center p-4">
              <appkit-network-button />
            </div>
          </div>
        )}
        { signMessagePending && (
          <div className="grid bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <appkit-button />
            <h3 className="text-sm font-semibold bg-gray-100 p-2 text-center">Signing a message</h3>
            <div className="flex justify-center items-center p-4">
              Go ahead and sign it buddy: <span className="text-blue-500 font-bold">{messageToSign}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
