import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceQuoteForm from '@/components/ServiceQuoteForm';

const ServiceQuote: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <ServiceQuoteForm />
      </div>

      <Footer />
    </div>
  );
};

export default ServiceQuote;
