import { etherToWei, weiToEther } from "@/unipass/format_bignumber";
import { Button, Divider, Input } from "antd";
import { providers } from "ethers";
import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useProvider,
  useSigner,
  useSignTypedData,
} from "wagmi";
import logo from "../assets/UniPass.svg";

const { TextArea } = Input;

const domain = {
  name: "Ether Mail",
  version: "1",
  chainId: 5,
  verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
} as const;

const types = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" },
  ],
} as const;

const value = {
  from: {
    name: "Cow",
    wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
  },
  to: {
    name: "Bob",
    wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
  },
  contents: "Hello, Bob!",
} as const;

function App() {
  const { isConnected, address } = useAccount();
  const provider = useProvider<providers.Web3Provider>();
  const { data: signer } = useSigner();
  const { connect, connectors, pendingConnector, isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState(0);
  const [signature, setSignature] = useState("");
  const [nativeHash, setNativeHash] = useState("");

  const {
    data: typedDataSig,
    reset: restTypedData,
    signTypedData,
  } = useSignTypedData({
    domain,
    types,
    value,
  });

  useEffect(() => {
    if (provider && signer && address) {
      provider?.getBalance(address as string).then((res) => {
        console.log(res);

        setBalance(weiToEther(res ?? 0));
      });

      signer?.getChainId().then((res) => {
        setChainId(res);
      });
    }
  }, [provider, signer]);

  const signMessage = async () => {
    if (signer) {
      const signature = await signer.signMessage(
        "Welcome to use Wagmi with unipass!"
      );
      setSignature(signature);
    }
  };

  const sendTransaction = async () => {
    if (signer && address) {
      const txParams = {
        from: address,
        to: "0x2B6c74b4e8631854051B1A821029005476C3AF06",
        value: etherToWei("0.001"),
        data: "0x",
      };
      console.log(txParams);

      const txResp = await signer.sendTransaction(txParams);
      const res = await txResp.wait();
      console.log(res);
      setNativeHash(res.transactionHash);
    }
  };

  const getConnectionButtons = () => {
    if (!isConnected) {
      return (
        <>
          {connectors.map((connector) => (
            <Button
              disabled={!connector.ready}
              key={connector.id}
              onClick={() => connect({ connector })}
              type="primary"
              style={{ marginRight: "30px" }}
            >
              {connector.name}
              {!connector.ready && " (unsupported)"}
            </Button>
          ))}
        </>
      );
    }

    return (
      <Button
        onClick={() => {
          setBalance("0");
          setChainId(0);
          setSignature("");
          setNativeHash("");
          restTypedData();
          disconnect();
        }}
        type="dashed"
      >
        Disconnect Wallet
      </Button>
    );
  };

  return (
    <div style={{ marginBottom: "50px", width: "450px" }}>
      <img src={logo} alt="" width={150} />
      <h1>Wagmi + UniPass</h1>
      <h3>Connect with:</h3>
      {getConnectionButtons()}
      <Divider />
      <h3>Wallet States:</h3>
      <>
        <h4>address: {address}</h4>
        <h4>Balance: {balance}</h4>
        <h4>ChainId: {chainId || "-"}</h4>
      </>
      <Divider />
      <h3>Sign Message:</h3>
      <Button
        type="primary"
        disabled={!isConnected}
        onClick={signMessage}
        style={{ marginRight: "30px" }}
      >
        Sign Message
      </Button>
      <h4>signature:</h4>
      <TextArea rows={4} value={signature} />
      <Divider />
      <Button type="primary" onClick={signTypedData} disabled={!isConnected}>
        Sign Typed Data(EIP-712)
      </Button>
      <h4>Typed Data Signature:</h4>
      <TextArea rows={4} value={typedDataSig} />
      <Divider />
      <h3>Send Transaction:</h3>
      <Button onClick={sendTransaction} type="primary" disabled={!isConnected}>
        Send native Token
      </Button>
      <h4>native tx hash:</h4>
      <TextArea rows={1} value={nativeHash} />
      <Divider />
    </div>
  );
}

export default App;
