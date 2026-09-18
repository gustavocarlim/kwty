import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import './styles.css'

const destination = 'https://www.instantfollow.com.br'

function FloatingDot({ className, delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.span
      aria-hidden="true"
      className={`floating-dot ${className}`}
      animate={reduceMotion ? undefined : { y: [0, -18, 0], x: [0, 7, 0] }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function App() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <FloatingDot className="dot-one" delay={0.4} />
      <FloatingDot className="dot-two" delay={1.1} />
      <FloatingDot className="dot-three" delay={0.8} />

      <motion.header
        className="topbar"
        initial={reduceMotion ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="brand" aria-label="Pulse, home">pulse<span>.</span></p>
        <span className="status"><i /> digital experience</span>
      </motion.header>

      <section id="home" className="hero" aria-labelledby="headline">
        <motion.div
          className="eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <Sparkles size={15} strokeWidth={2.4} />
          <span>your next step starts here</span>
        </motion.div>

        <motion.h1
          id="headline"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Give more power<br />
          <em>to your presence.</em>
        </motion.h1>

        <motion.p
          className="intro"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          A simple boost can transform how you are seen across social media.
          Discover new possibilities for your digital moment.
        </motion.p>

        <motion.div
          className="cta-wrap"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <a className="cta" href={destination} target="_blank" rel="noopener noreferrer">
            <span>Get started</span>
            <span className="cta-icon"><ArrowUpRight size={20} strokeWidth={2.5} /></span>
          </a>
          <span className="cta-caption">You will be redirected to our partner site</span>
        </motion.div>
      </section>

      <motion.footer
        className="footer"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        <span>made for those who want to be seen</span>
        <span className="footer-mark">© {new Date().getFullYear()} pulse.</span>
      </motion.footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
)
