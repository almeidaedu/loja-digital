import Hero from '../../components/home/Hero/Hero';
import TrustBar from '../../components/home/TrustBar/TrustBar';
import Categories from '../../components/home/Categories/Categories';
import ProductGrid from '../../components/home/ProductGrid/ProductGrid';
import Testimonials from '../../components/home/Testimonials/Testimonials';
import UrgencyBanner from '../../components/home/UrgencyBanner/UrgencyBanner';
import Benefits from '../../components/home/Benefits/Benefits';
import FAQ from '../../components/home/FAQ/FAQ';
import './Home.css';

// Cada bloco é dono da própria seção: padding, título e âncora. A Home só
// compõe. Antes ela embrulhava Benefits e FAQ numa segunda <section> com um
// segundo título — dois h2 por bloco e o padding vertical em dobro.
export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <Categories />
      <ProductGrid />

      <section id="prova-social" className="home-section home-section--alt">
        <div className="container">
          <h2 className="section-title">O QUE DIZEM NOSSOS <span>CLIENTES</span></h2>
          <p className="section-subtitle">Mais de 5.000 pedidos entregues com qualidade</p>
          <Testimonials />
        </div>
      </section>

      <UrgencyBanner />
      <Benefits />

      {/* Só a âncora que o Header e o Footer usam. A Fase 9 passa o id para
          dentro do FAQ e este div sai. */}
      <div id="faq">
        <FAQ />
      </div>
    </main>
  );
}
