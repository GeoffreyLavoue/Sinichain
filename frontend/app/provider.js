'use client'
//import 'dotenv/config'
import { ChakraProvider } from '@chakra-ui/react'


import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia } from 'viem/chains';
import { infuraProvider } from 'wagmi/providers/infura'



import '@rainbow-me/rainbowkit/styles.css';

import {
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';


const infuraApiKey = '4402eea5cd834d7591282df136b64a65'
const alchemyApiKey = 'dgUBa3VtG8tXAoh54xKcoiKONfc4W2zn'
const projectId = '970ce288515d329356bc264eb52983ad'

const { chains, publicClient } = configureChains(
    [sepolia],
    [
        infuraProvider({ apiKey: infuraApiKey })
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: projectId,
    chains
});

const wagmiConfig = createConfig({
    autoConnect: false,
    publicClient,
    connectors
})


export default function Providers({ children }) {
    return (
            <WagmiConfig config={wagmiConfig}>

                <WagmiConfig config={wagmiConfig}>
                    <RainbowKitProvider chains={chains}>
                        {children}
                    </RainbowKitProvider>
                </WagmiConfig>

            </WagmiConfig>
    )
}