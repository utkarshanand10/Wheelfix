import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageBanner from "@/components/PageBanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Award, 
  Clock, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CheckCircle,
  TrendingUp,
  Heart,
  Zap
} from "lucide-react"
import { Link } from "react-router-dom"

const About = () => {
  const stats = [
    { icon: <Users className="h-8 w-8" />, number: "50,000+", label: "Happy Customers" },
    { icon: <Award className="h-8 w-8" />, number: "500+", label: "Service Centers" },
    { icon: <Clock className="h-8 w-8" />, number: "15+", label: "Years Experience" },
    { icon: <Shield className="h-8 w-8" />, number: "100%", label: "Genuine Parts" }
  ]

  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Customer First",
      description: "Your satisfaction is our top priority. We go above and beyond to ensure exceptional service."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "We use only genuine parts and follow manufacturer guidelines for all services."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Innovation",
      description: "Constantly evolving with the latest automotive technology and service methods."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Excellence",
      description: "Striving for excellence in every aspect of our automotive services."
    }
  ]

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image: "/team/rajesh.jpg",
      description: "15+ years in automotive industry"
    },
    {
      name: "Priya Sharma",
      role: "Technical Director",
      image: "/team/priya.jpg",
      description: "Expert in modern vehicle systems"
    },
    {
      name: "Amit Patel",
      role: "Operations Head",
      image: "/team/amit.jpg",
      description: "Specializes in service optimization"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner
        title="India's Trusted Automotive Partner"
        subtitle="Since 2008, delivering expert vehicle maintenance and repairs across India"
        imageUrl="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1920&auto=format&fit=crop"
      >
        <Link to="/contact">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-lg">Get In Touch</Button>
        </Link>
        <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 text-lg">Our Story</Button>
      </PageBanner>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2008, Wheelyfix began as a small garage in Mumbai with a simple mission: 
                  to provide honest, reliable automotive services that customers could trust.
                </p>
                <p>
                  Over the years, we've grown into one of India's leading automotive service networks, 
                  with over 500 service centers across the country. Our commitment to quality, 
                  transparency, and customer satisfaction has remained unchanged.
                </p>
                <p>
                  Today, we serve thousands of customers daily, offering comprehensive vehicle 
                  maintenance and repair services for all major automotive brands in India.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/services">
                  <Button className="bg-accent hover:bg-accent/90 text-white">
                    Explore Our Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">15+ Years of Excellence</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">500+ Service Centers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">50,000+ Happy Customers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">100% Genuine Parts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">24/7 Customer Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -right-1/4 -top-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/30 blur-3xl"></div>
          <div className="absolute -left-1/4 -bottom-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/30 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge 
              className="px-6 py-2 text-primary-700 bg-primary-50 hover:bg-primary-100 mb-6"
              variant="secondary"
            >
              Our Values
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              What Drives Us Forward
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              The core principles that shape our service excellence and customer commitment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden group hover:shadow-xl transition-all duration-500
                         border-gray-100 hover:border-primary-100 rounded-2xl
                         bg-white/70 backdrop-blur-sm hover:bg-white"
              >
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 
                                 rounded-2xl bg-primary-100 text-primary-600
                                 group-hover:scale-110 group-hover:bg-primary-200 
                                 transition-all duration-300">
                      {value.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 
                               transition-colors duration-300">
                    {value.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>

                  {/* Hover Effect Border */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 
                                transform scale-x-0 group-hover:scale-x-100 
                                transition-transform duration-500 origin-left" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <Link to="/contact">
              <Button 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg
                         rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                         transform hover:scale-105"
              >
                Join Our Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experts who drive Wheelyfix's success and innovation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-accent to-accent/90">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Experience Wheelyfix?</h3>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers who trust us with their vehicles. 
              Contact us today to schedule your next service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="secondary" size="lg" className="bg-white text-accent hover:bg-gray-100 px-8 py-3 text-lg">
                  Contact Us
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-accent px-8 py-3 text-lg">
                Find Nearest Center
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About
