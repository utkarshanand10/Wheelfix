import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const toTitle = (slug?: string) => {
  if (!slug) return 'Service';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const ServiceDetail = () => {
  const { slug } = useParams();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [slug]);

  const gallery = useMemo(() => {
    const u = (path: string) => `${path}?w=1200&q=80&auto=format&fit=crop`;
    const maps: Record<string, string[]> = {
      'tyre-service': [
        u('https://images.unsplash.com/photo-1560472354-b33ff0c44a43'),
        u('https://images.unsplash.com/photo-1503376780353-7e6692767b70'),
        u('https://images.unsplash.com/photo-1542362567-b07e54358753'),
      ],
      'ac-service-and-repair': [
        u('https://images.unsplash.com/photo-1486006920555-c77dcf18193c'),
        u('https://images.unsplash.com/photo-1606229365485-93a05c445a1f'),
        u('https://images.unsplash.com/photo-1581092160607-ee22621dd758'),
      ],
      'batteries': [
        u('https://images.unsplash.com/photo-1593941707882-a5bac6861d75'),
        u('https://images.unsplash.com/photo-1603072387173-4017b0fb4d58'),
        u('https://images.unsplash.com/photo-1617302223919-9a47c97a0d8d'),
      ],
      'denting-and-painting': [
        u('https://images.unsplash.com/photo-1607860108855-64acf2078ed9'),
        u('https://images.unsplash.com/photo-1520975922284-9c5ed2f5a84f'),
        u('https://images.unsplash.com/photo-1541444455710-1fef2758bded'),
      ],
      'car-services': [
        u('https://images.unsplash.com/photo-1542362567-b07e54358753'),
        u('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8'),
        u('https://images.unsplash.com/photo-1517048676732-d65bc937f952'),
      ],
      'detailing-services': [
        u('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3'),
        u('https://images.unsplash.com/photo-1563729784474-d77dbb933a9a'),
        u('https://images.unsplash.com/photo-1593942804520-37d7df70a3db'),
      ],
      'car-spa-and-cleaning': [
        u('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2'),
        u('https://images.unsplash.com/photo-1558222218-b7b54eede3da'),
        u('https://images.unsplash.com/photo-1483104879057-379b6c2fe57f'),
      ],
      'car-inspections': [
        u('https://images.unsplash.com/photo-1517048676732-d65bc937f952'),
        u('https://images.unsplash.com/photo-1525609004556-c46c7d6cf023'),
        u('https://images.unsplash.com/photo-1532635241-17e820acc59f'),
      ],
      'windshields-and-lights': [
        u('https://images.unsplash.com/photo-1544636331-e26879cd4d9b'),
        u('https://images.unsplash.com/photo-1483721310020-03333e577078'),
        u('https://images.unsplash.com/photo-1493238792000-8113da705763'),
      ],
      'suspension-and-fitments': [
        u('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13'),
        u('https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),
        u('https://images.unsplash.com/photo-1617975608220-4e6f1d88f7e7'),
      ],
      'engines-and-carburetor': [
        u('https://images.unsplash.com/photo-1487754180451-c456f719a1fc'),
        u('https://images.unsplash.com/photo-1587731556938-38755bff5ab7'),
        u('https://images.unsplash.com/photo-1605557617923-4f21f2f9c454'),
      ],
      'service-and-repair': [
        u('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8'),
        u('https://images.unsplash.com/photo-1581093588401-2fe82b7f1cfd'),
        u('https://images.unsplash.com/photo-1551836022-4c4c79ecde51'),
      ],
      'transmission': [
        u('https://images.unsplash.com/photo-1517048676732-d65bc937f952'),
        u('https://images.unsplash.com/photo-1518779578993-ec3579fee39f'),
        u('https://images.unsplash.com/photo-1532635333047-43f943a11b02'),
      ],
      'fitments': [
        u('https://images.unsplash.com/photo-1525609004556-c46c7d6cf023'),
        u('https://images.unsplash.com/photo-1503376780353-7e6692767b70'),
        u('https://images.unsplash.com/photo-1517048676732-d65bc937f952'),
      ],
      'body-parts': [
        u('https://images.unsplash.com/photo-1607860108855-64acf2078ed9'),
        u('https://images.unsplash.com/photo-1520975922284-9c5ed2f5a84f'),
        u('https://images.unsplash.com/photo-1541444455710-1fef2758bded'),
      ],
      'electricals-services': [
        u('https://images.unsplash.com/photo-1581092160607-ee22621dd758'),
        u('https://images.unsplash.com/photo-1567443024551-f3e3cc0b3f4e'),
        u('https://images.unsplash.com/photo-1541417904950-b855846fe074'),
      ],
      'tyres-and-wheel-care': [
        u('https://images.unsplash.com/photo-1560472354-b33ff0c44a43'),
        u('https://images.unsplash.com/photo-1503376780353-7e6692767b70'),
        u('https://images.unsplash.com/photo-1542362567-b07e54358753'),
      ],
      'insurance-claims': [
        u('https://images.unsplash.com/photo-1571068316344-75bc76f77890'),
        u('https://images.unsplash.com/photo-1560759226-14da22a643a1'),
        u('https://images.unsplash.com/photo-1543164904-8b427e6a0f0c'),
      ],
    };
    return maps[slug || ''] || [
      u('https://images.unsplash.com/photo-1542362567-b07e54358753'),
      u('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8'),
      u('https://images.unsplash.com/photo-1517048676732-d65bc937f952'),
    ];
  }, [slug]);

  return (
    <>
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4 space-y-10">
        <div>
          <h1 className="text-4xl font-bold mb-3">{toTitle(slug)}</h1>
          <p className="text-gray-600 max-w-3xl">
            Keep your vehicle in peak condition with our comprehensive {toTitle(slug)} package. Our
            certified technicians use OEM-grade parts and follow manufacturer-recommended procedures to
            ensure safety, performance, and warranty compliance.
          </p>
        </div>

        {/* Image gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gallery.map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-md">
              <img src={src} alt={`${toTitle(slug)} ${i + 1}`} className="w-full h-64 object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">What’s included</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Multi-point inspection and diagnostic scan</li>
              <li>Genuine parts and fluids with manufacturer specification</li>
              <li>Road-test, quality checks, and detailed service report</li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-lg border p-6">
            <h3 className="text-xl font-semibold mb-4">Transparent Pricing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Basic</span>
                <span className="font-bold">₹1,499</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Standard</span>
                <span className="font-bold">₹2,999</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Comprehensive</span>
                <span className="font-bold">₹4,999</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Prices vary by vehicle model and brand.</p>
            {/* Book Now button removed - booking only available from homepage */}
          </div>
        </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ServiceDetail;


