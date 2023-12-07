import React from 'react'
import Image from 'next/image'
import styles from '../../page.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Header = () => {
    return (
    <>
        <div className={styles.headerLeft}>
            <Image
                src="/titre.png"
                alt="Sinichain.js Logo"
                width={180}
                height={180}
                priority
            />
        </div>
        <div className={styles.headerRight}>
            <ConnectButton />
        </div>
    </>
    )
}

export default Header