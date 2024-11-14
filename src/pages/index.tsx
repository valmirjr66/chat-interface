import styles from '@/styles/Home.module.css';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.location.href = `/chat/${uuidv4()}`;
  }, []);

  return (
    <main className={styles.app}>
      <img src='/loading.gif' width={300} alt='Loading'/>
    </main>
  );
}
