// pages/contact.js
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../page.module.css'; // Assurez-vous que ce fichier existe et contient les bonnes classes CSS

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact - Sinichain</title>
      </Head>
      <Link href="/">
        <a className={styles.homeButton}>Home</a> {/* Bouton Home */}
      </Link>

      <div className={styles.container}>
        <header className={styles.center}>
          <Image
            src="/titre.png"
            alt="Logo Sinichain"
            width={50}
            height={50}
          />
          <h1>Contactez-nous</h1>
        </header>

        <main className={styles.main}>
          <div className={styles.contactInfo}>
            <p>Téléphone: +33 1 23 45 67 89</p>
          </div>

          <form className={styles.contactForm}>
            <label htmlFor="name">Nom</label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required></textarea>

            <button type="submit">Envoyer</button>
          </form>
        </main>
      </div>
    </>
  );
}
