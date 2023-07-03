import { UniPassConnector } from "@unipasswallet/wagmi-connector";
import { Outlet } from "umi";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli, polygonMumbai } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import styles from "./index.less";

export default function Layout() {
  const { chains, publicClient } = configureChains(
    [goerli, polygonMumbai],
    [publicProvider()]
  );

  const unipass = new UniPassConnector({
    options: {
      chainId: polygonMumbai.id,
      returnEmail: false,
      appSettings: {
        appName: "wagmi demo",
      },
    },
  });

  // Set up wagmi config
  const config = createConfig({
    autoConnect: true,
    connectors: [
      unipass,
      new MetaMaskConnector({
        chains,
      }),
    ],
    publicClient,
  });

  return (
    <div className={styles.navs}>
      <WagmiConfig config={config}>
        <Outlet />
      </WagmiConfig>
    </div>
  );
}
