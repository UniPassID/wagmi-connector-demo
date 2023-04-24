import { UniPassConnector } from "@unipasswallet/wagmi-connector";
import { Outlet } from "umi";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli, polygonMumbai } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { publicProvider } from "wagmi/providers/public";
import styles from "./index.less";

export default function Layout() {
  const { chains, provider } = configureChains(
    [goerli, polygonMumbai],
    [publicProvider()]
  );

  const unipass = new UniPassConnector({
    options: {
      connect: {
        chainId: goerli.id,
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
        chainId: goerli.id,
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
