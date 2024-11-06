import styles from '@/styles/Home.module.css';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/chat/${uuidv4()}`);
  }, [])

  return (
    <main className={styles.app}>
      <img src='/loading.gif' width={300} />
    </main>
  )
}
