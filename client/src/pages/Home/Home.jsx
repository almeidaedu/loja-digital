import Hero from '../../components/home/Hero/Hero';
import TrustBar from '../../components/home/TrustBar/TrustBar';
import Categories from '../../components/home/Categories/Categories';
import ProductGrid from '../../components/home/ProductGrid/ProductGrid';
import Testimonials from '../../components/home/Testimonials/Testimonials';
import UrgencyBanner from '../../components/home/UrgencyBanner/UrgencyBanner';
import Benefits from '../../components/home/Benefits/Benefits';
import FAQ from '../../components/home/FAQ/FAQ';

// Cada bloco é dono da própria seção: padding, título e âncora. A Home só
// compõe. Antes ela embrulhava Benefits, FAQ e os depoimentos numa segunda
// <section> com um segundo título — dois h2 por bloco e o padding em dobro.
// Fragmento e não <main>: o `<main>` é do Layout, e eram dois aninhados.
export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Categories />
      <ProductGrid />
      <Testimonials />
      <UrgencyBanner />
      <Benefits />
      <FAQ />
    </>
  );
}
