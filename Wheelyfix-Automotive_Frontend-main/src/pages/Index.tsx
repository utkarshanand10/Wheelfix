import { useEffect } from 'react';
import Header from "@/components/Header";
import DynamicHero from "@/components/DynamicHero";
import DynamicServices from "@/components/DynamicServices";
import DynamicProductCategory from "@/components/DynamicProductCategory";
import HowWeWork from "@/components/HowWeWork";
import Testimonials from "@/components/Testimonials";
import AppDownload from "@/components/AppDownload";
import Brands from "@/components/Brands";
import RecentVlogs from "@/components/RecentBlogs";
import Footer from "@/components/Footer";
import '@/styles/animations.css';

const Index = () => {
  useEffect(() => {
    // Add scroll reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe all sections
    document.querySelectorAll('section').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <section className="animate-fade-in-up">
        <DynamicHero />
      </section>
      
      <section className="py-16 bg-white animate-fade-in-up">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Our Services</h2>
          <DynamicServices />
        </div>
      </section>
      
      <section className="py-16 bg-gray-50 animate-fade-in-up">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Shop by Category</h2>
          <DynamicProductCategory />
        </div>
      </section>
      
      <section className="py-16 bg-white animate-fade-in-up">
        <div className="container mx-auto px-4">
          <HowWeWork />
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 animate-fade-in-up">
        <div className="container mx-auto px-4">
          <Testimonials />
        </div>
      </section>
      
      <section className="py-16 bg-white animate-fade-in-up">
        <div className="container mx-auto px-4">
          <AppDownload />
        </div>
      </section>
      
      <section className="py-16 bg-gray-50 animate-fade-in-up">
        <div className="container mx-auto px-4">
          <Brands />
        </div>
      </section>
      
      <section className="py-16 bg-white animate-fade-in-up">
        <div className="container mx-auto px-4">
          <RecentVlogs />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;