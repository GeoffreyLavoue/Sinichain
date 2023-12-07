// pages/equipe.js
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../page.module.css'; // Utilisation du CSS existant

export default function Equipe() {
  return (
    <>
      <Head>
        <title>Equipe - Sinichain</title>
      </Head>
      <Link href="/">
        <a className={styles.homeButton}>Home</a> {/* Bouton Home */}
      </Link>
      <div className={styles.container}>
        <header className={styles.headerTeam}>
          <h1>L'équipe</h1>
          <Image src="/titre.png" alt="Titre" width={180} height={180} />
        </header>


        <main className={styles.main}>
          <div className={styles.teamGrid}>
            {/* Membre 1 */}
            <div className={styles.teamMember}>
              <Image src="/portrait_placeholder.png" alt="Romain" width={200} height={200} className={styles.roundedImage} />
              <h2>Romain</h2>
              <p>Scrum Master</p>
            </div>

            {/* Membre 2 */}
            <div className={styles.teamMember}>
              <Image src="/portrait_placeholder.png" alt="Brice" width={200} height={200} className={styles.roundedImage} />
              <h2>Brice</h2>
              <p>Scrum Master</p>
            </div>

            {/* Membre 3 */}
            <div className={styles.teamMember}>
              <Image src="/portrait_placeholder.png" alt="Stephane" width={200} height={200} className={styles.roundedImage} />
              <h2>Stephane</h2>
              <p>Scrum Master</p>
            </div>

            {/* Membre 4 */}
            <div className={styles.teamMember}>
              <Image src="/portrait_placeholder.png" alt="Geoffrey" width={200} height={200} className={styles.roundedImage} />
              <h2>Geoffrey</h2>
              <p>Développeur</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
