import { UniPassConnector } from "@unipasswallet/wagmi-connector";
import { Outlet } from "umi";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { publicProvider } from "wagmi/providers/public";
import styles from "./index.less";

export default function Layout() {
  const { chains, provider } = configureChains(
    [
      {
        ...chain.goerli,
        rpcUrls: { default: "https://node.wallet.unipass.id/eth-goerli" },
      },
      {
        ...chain.polygonMumbai,
        rpcUrls: { default: "https://node.wallet.unipass.id/polygon-mumbai" },
      },
    ],
    [publicProvider()]
  );

  const unipass = new UniPassConnector({
    options: {
      connect: {
        chainId: chain.polygonMumbai.id,
        returnEmail: false,
        appSettings: {
          appName: "wagmi demo",
        },
      },
    },
  });

  const connectors = [
    unipass,
    new MetaMaskConnector({
      chains,
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
        chainId: chain.polygonMumbai.id,
      },
    }),
  ];

  const wagmiClient = createClient({
    autoConnect: false,
    connectors,
    provider,
  });

  return (
    <div className={styles.navs}>
      <WagmiConfig client={wagmiClient}>
        <Outlet />
      </WagmiConfig>
    </div>
  );
}
