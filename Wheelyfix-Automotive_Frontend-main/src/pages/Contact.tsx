import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageBanner from "@/components/PageBanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare,
  Send,
  Star,
  CheckCircle
} from "lucide-react"

const Contact = () => {
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      details: ["+91 98765 43210", "+91 98765 43211"],
      description: "24/7 customer support"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: ["info@wheelyfix.com", "support@wheelyfix.com"],
      description: "We'll respond within 2 hours"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      details: ["500+ Service Centers", "Across India"],
      description: "Find your nearest center"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      details: ["Mon-Sat: 8:00 AM - 8:00 PM", "Sunday: 9:00 AM - 6:00 PM"],
      description: "Emergency support available 24/7"
    }
  ]

  const features = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "24/7 Customer Support"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Quick Response Time"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Expert Technical Assistance"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Multiple Contact Channels"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner
        title="We're Here to Help You"
        subtitle="Have questions or need a booking? Our team is ready to assist you 24/7"
        imageUrl="https://images.unsplash.com/photo-1517502166878-35c93a0072bb?q=80&w=1920&auto=format&fit=crop"
      >
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-lg">Call Now</Button>
        <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 text-lg">Send Message</Button>
      </PageBanner>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                    {info.icon}
                  </div>
                  <CardTitle className="text-xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <div key={idx} className="text-gray-900 font-medium">{detail}</div>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mt-3">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Enter your first name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Enter your last name" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter your phone number" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service">Service Required</Label>
                      <select 
                        id="service" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      >
                        <option value="">Select a service</option>
                        <option value="car-service">Car Service</option>
                        <option value="bike-service">Bike Service</option>
                        <option value="ac-service">AC Service</option>
                        <option value="battery-service">Battery Service</option>
                        <option value="brake-service">Brake Service</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us about your vehicle and service needs..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white py-3">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>Find Our Service Centers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive Map Coming Soon</p>
                      <p className="text-sm text-gray-500">500+ locations across India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-accent" />
                    <span>Why Choose Wheelyfix?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="text-green-500">
                          {feature.icon}
                        </div>
                        <span className="text-gray-700">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="shadow-lg border-accent/20 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-accent">Emergency Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-accent" />
                      <div>
                        <div className="font-semibold text-gray-900">24/7 Helpline</div>
                        <div className="text-gray-600">+91 98765 43210</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      For roadside assistance and emergency repairs, call our 24/7 helpline.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our services and policies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I book a service?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can book a service through our website, mobile app, or by calling our customer support. 
                  We'll schedule a convenient time for you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What are your service hours?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our service centers are open Monday to Saturday from 8:00 AM to 8:00 PM, 
                  and Sundays from 9:00 AM to 6:00 PM. Emergency support is available 24/7.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you provide warranty on services?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we provide warranty on all our services and genuine parts. 
                  The warranty period varies depending on the service type.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does a typical service take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Service duration varies from 1-4 hours depending on the type of service. 
                  We'll provide an estimated completion time when you book.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-accent to-accent/90">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-white/90 mb-8">
              Contact us today to schedule your next service or get a free consultation. 
              Our expert team is ready to help you keep your vehicle in top condition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Booking buttons removed - booking only available from homepage */}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Contact
