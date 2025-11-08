import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Jahnvi Kanth",
      review: "WHEELYFIX did a great job servicing my Honda Activa, which involved replacing most of the damaged parts. Really friendly service, I would highly recommend"
    },
    {
      name: "Rohan Kataria", 
      review: "I had the BEST experience with WHEELYFIX: great & professional bike service, super fast and friendly communication, price value is unbeatable. I'll definitely will bring my bike there again and I can only recommend WHEELYFIX to 100%"
    },
    {
      name: "Sarita Dua",
      review: "Outstanding quality of work at a great price, cost free pick up and drop off with the addition of professional finish, what more to ask for. Definetly recommend WHEELYFIX regardless if small or big problem"
    },
    {
      name: "Ravindra Pratap",
      review: "Superb service! Bike collected, serviced & repaired to the highest standards and returned in pristine condition. Will definitely use WHEELYFIX again. Highly recommended"
    },
    {
      name: "Mayank Awasthi", 
      review: "In all terrains and situations I can blindly trust my motorcycle, because it is serviced by Wheelyfix Services. The brand who feels motorcycles."
    },
    {
      name: "Sweta Goel",
      review: "The study of the art of motorcycle maintenance is really a miniature study of the art of rationality itself. Working on a motorcycle, working well, caring, is to become part of a process, to achieve an inner peace of mind."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute -left-1/4 -bottom-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-3xl"></div>
        <div className="absolute -right-1/4 -top-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-block px-6 py-2 bg-primary-100 text-primary-700 font-semibold rounded-full mb-6 animate-fade-in">
            Customer Reviews
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            2,50,000+ Happy Customers
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Hear what our customers have to say about their experience with Wheelyfix
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-12">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full border-2 border-primary-200 text-primary-600
                     hover:bg-primary-50 hover:border-primary-300 transition-all duration-300"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full border-2 border-primary-200 text-primary-600
                     hover:bg-primary-50 hover:border-primary-300 transition-all duration-300"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <Card 
              key={index} 
              className="relative p-8 bg-white/70 backdrop-blur-sm hover:bg-white
                       border-gray-100 hover:border-primary-100
                       rounded-2xl overflow-hidden group
                       transition-all duration-500 hover:shadow-xl"
            >
              {/* Quote Icon */}
              <div className="absolute -right-6 -top-6 text-primary-100">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="120" 
                  height="120" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="opacity-30"
                >
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                </svg>
              </div>

              {/* Stars */}
              <div className="flex items-center mb-6 relative">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5 text-yellow-400 fill-current transform 
                             group-hover:scale-110 transition-transform duration-300"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
              
              {/* Review Text */}
              <p className="text-gray-600 mb-6 text-base leading-relaxed relative z-10">
                "{testimonial.review}"
              </p>
              
              {/* Customer Name */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-700 font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Verified Customer
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 
                            transform scale-x-0 group-hover:scale-x-100 
                            transition-transform duration-500 origin-left" />
            </Card>
          ))}
        </div>

        {/* View All Reviews Button */}
        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            className="px-8 py-6 text-lg font-medium border-2 border-primary-200 text-primary-600
                     hover:bg-primary-50 hover:border-primary-300 transition-all duration-300
                     rounded-xl shadow-sm hover:shadow-md"
          >
            View All Reviews
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;