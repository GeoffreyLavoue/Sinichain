import React from 'react'

import styles from '../../page.module.css'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
    return (
        <>
            <a
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Link href="/Contact">
                    <h2>Contact</h2>
                    <p>Tél ou mail.</p>
                </Link>
            </a>

            <a
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Link href="/Doc">
                    <h2>Documentation</h2>
                    <p>Smart contract, Litepaper, roadmap, etc..</p>
                </Link>
            </a>

            <a
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Link href="/Communaute">
                    <h2>
                        Rejoins la communauté
                    </h2>
                    <p>
                        <Image
                            src="/discord.png"
                            alt="discord.js Logo"
                            width={30}
                            height={30}
                            priority
                        />
                        <Image
                            src="/x.png"
                            alt="x.js Logo"
                            width={30}
                            height={30}
                            style={{
                                marginLeft: '20px',
                            }}
                            priority
                        />
                    </p>
                </Link>
            </a>

            <a
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Link href="/Equipe">
                    <h2>
                        Equipe
                    </h2>
                    <p>Découvrez l'équipe derrière SiniChain!</p>
                </Link>
            </a>
        </>
    )
}

export default Footer