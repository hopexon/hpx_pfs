'use client'

import styles from '@/app/tips/contents/css/modal_with_command_attr_2026.module.css'

export default function ModalWithCommandAttr() {
  return (
    <>
      <section className={styles.modal__with__command__wrap}>
        <div className={styles.modal__with__command__btn__wrap}>
          {Array.from({ length: 2 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type='button'
              commandfor={`dialog__${num}`}
              command='show-modal'
            >
              Open Modal {num}
            </button>
          ))}
          <button
            key='3'
            type='button'
            commandfor='dialog__3'
            command='show-modal'
          >
            Open Modal 3
          </button>
        </div>
      </section>

      {Array.from({ length: 2 }, (_, i) => i + 1).map((num) => (
        <div key={num} className={styles.dialog__wrap}>
          <dialog
            key={num}
            id={`dialog__${num}`}
            aria-labelledby={`dialog__${num}-heading`}
            closedby='any'
            autoFocus
          >
            <div className={styles.dialog__inner}>
              <h1 id={`dialog__${num}-heading`}>Modal Title {num}</h1>
              <p>Modal Content</p>
              <button
                type='button'
                commandfor={`dialog__${num}`}
                command='close'
                className={styles.close__btn}
              >
                Close Modal
              </button>
            </div>
          </dialog>
        </div>
      ))}
      <div className={styles.dialog__wrap}>
        <dialog
          id={`dialog__3`}
          aria-labelledby={`dialog__3-heading`}
          closedby='any'
          autoFocus
        >
          <div className={styles.dialog__inner}>
            <h1 id={`dialog__3-heading`}>Modal Title 3</h1>
            <p>
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
              Modal Content<br />
            </p>
            <button
              type='button'
              commandfor={`dialog__3`}
              command='close'
              className={styles.close__btn}
            >
              Close Modal
            </button>
          </div>
        </dialog>
      </div>
    </>
  )
}