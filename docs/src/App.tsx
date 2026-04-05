import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import DemoSection from './components/DemoSection'
import Installation from './components/Installation'
import ApiRef from './components/ApiRef'
import TypesSection from './components/TypesSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DemoSection />
        <Installation />
        <ApiRef />
        <TypesSection />
      </main>
      <Footer />
    </div>
  )
}
