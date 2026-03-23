import styles from '@/styles/not-found.module.css'

export default function NotFound() {
  return (
    <div className="main__wrap">
      <div className="section__wrapper">
        <div className={styles.notFound__wrap}>
          <h2 className={styles.notFound__message}>Sorry you asshole are sticking the wrong address.</h2>
        </div>
      </div>
    </div>
  )
}