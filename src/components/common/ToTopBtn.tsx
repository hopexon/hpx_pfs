'use client'

export default function ToTopBtn() {
  return <button 
          type='button'
          className="toTop"
          aria-label="ページのトップに戻る" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        </button>;
}