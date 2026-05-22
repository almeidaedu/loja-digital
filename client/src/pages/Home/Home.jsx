import { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import Hero from '../../components/home/Hero/Hero';
import TrustBar from '../../components/home/TrustBar/TrustBar';
import Categories from '../../components/home/Categories/Categories';
import ProductGrid from '../../components/home/ProductGrid/ProductGrid';
import Testimonials from '../../components/home/Testimonials/Testimonials';
import UrgencyBanner from '../../components/home/UrgencyBanner/UrgencyBanner';
import Benefits from '../../components/home/Benefits/Benefits';
import FAQ from '../../components/home/FAQ/FAQ';
import './Home.css';

export default function Home() {
  const [categories, setCategories] = useState([]);

  useScrollAnimation();

  useEffect(() => {
    categoryService.getAll()
      .then(({ categories }) => setCategories(categories ?? []))
      .catch(() => {});
  }, []);

  return (
    <main>
      <Hero />
      <TrustBar />
      <section id="categorias">
        <Categories categories={categories} />
      </section>
      <ProductGrid />

      <section id="prova-social" className="home-section home-section--alt animate-on-scroll">
        <div className="container">
          <h2 className="section-title">O QUE DIZEM NOSSOS <span>CLIENTES</span></h2>
          <p className="section-subtitle">Mais de 5.000 pedidos entregues com qualidade</p>
          <Testimonials />
        </div>
      </section>

      <UrgencyBanner />

      <section id="beneficios" className="home-section animate-on-scroll">
        <div className="container">
          <h2 className="section-title">POR QUE <span>CAMPO CHEIO</span>?</h2>
          <p className="section-subtitle">Mais que uma loja — uma paixão pelo futebol</p>
          <Benefits />
        </div>
      </section>

      <section id="faq" className="home-section home-section--alt animate-on-scroll">
        <div className="container">
          <h2 className="section-title">DÚVIDAS <span>FREQUENTES</span></h2>
          <p className="section-subtitle">Respondemos as perguntas mais comuns</p>
          <FAQ />
        </div>
      </section>
    </main>
  );
}
