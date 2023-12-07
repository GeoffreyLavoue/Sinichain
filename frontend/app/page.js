'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Flex } from '@chakra-ui/react'
import Link from 'next/link';
import Header from './components/Header/header'
import Content from './components/Content/content'
import Footer from './components/Footer/footer'


export default function Home() {
  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header/>
      </header>
      <main className={styles.main}>
        <Content/>
      </main>  
      <footer className={styles.grid}>
        <Footer/>
      </footer>
    </>
  )
}
