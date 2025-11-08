// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Card } from "./ui/card";
// import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Download } from "lucide-react";
// import logoImage from "../assets/logo.jpg";

// const Footer = () => {
//   return (
//     <footer className="bg-gradient-to-tr from-gray-900 via-gray-950 to-gray-900 text-white relative overflow-hidden">
//       {/* Decorative background pattern */}
//       <div className="absolute inset-0 pointer-events-none opacity-10" style={{background: 'radial-gradient(circle at 20% 40%, #ff6b35 0%, transparent 70%)'}} />
//       {/* Contact and Franchise Section */}
//       <div className="py-24 relative z-10">
//         <div className="container mx-auto px-4">
//           <div className="grid lg:grid-cols-2 gap-16">
//             {/* Contact Information */}
//             <div className="space-y-10">
//               <div className="flex items-center space-x-4 mb-8">
//                 <img src={wheelyfixLogo} alt="Wheelyfix Automotive" className="h-14 w-14 rounded-lg shadow-lg" />
//                 <div>
//                   <span className="text-3xl font-extrabold tracking-tight">WHEELYFIX</span>
//                   <div className="text-base text-gray-400 font-medium">Wheelyfix Automotive</div>
//                 </div>
//               </div>
//               <div className="space-y-8">
//                 <h3 className="text-2xl font-bold text-accent">GET IN TOUCH</h3>
//                 <div className="space-y-5">
//                   <div className="flex items-start space-x-4">
//                     <MapPin className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
//                     <div>
//                       <p className="text-gray-300 leading-relaxed">
//                         WHEELYFIX AUTOMOTIVE<br />
//                         4/43, Sector 5, Rajinder Nagar<br />
//                         Ghaziabad Uttar Pradesh 201005
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <Phone className="h-6 w-6 text-accent" />
//                     <div>
//                       <p className="text-xl font-semibold text-accent">+91 8700665747</p>
//                       <p className="text-sm text-gray-400">Toll Free Number</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <Mail className="h-6 w-6 text-accent" />
//                     <p className="text-gray-300">wheelyfix@gmail.com</p>
//                   </div>
//                 </div>
//               </div>
//               {/* Newsletter Subscription
//               <div className="bg-white/10 rounded-lg p-6 mt-8">
//                 <h4 className="font-semibold mb-3">Subscribe to Newsletter</h4>
//                 <form className="flex flex-col sm:flex-row gap-3">
//                   <Input placeholder="Your email address" className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent" />
//                   <Button className="bg-accent hover:bg-accent/90 text-white font-semibold px-6">Subscribe</Button>
//                 </form>
//               </div> */}
//               {/* Download App */}
//               {/* <div className="bg-white/10 rounded-lg p-6 mt-8">
//                 <h4 className="font-semibold mb-4">Download Our App</h4>
//                 <div className="flex space-x-3">
//                   <Button className="bg-black hover:bg-gray-800 text-white">
//                     <Download className="h-4 w-4 mr-2" />
//                     App Store
//                   </Button>
//                   <Button className="bg-black hover:bg-gray-800 text-white">
//                     <Download className="h-4 w-4 mr-2" />
//                     Play Store
//                   </Button>
//                 </div>
//               </div> */}
//             </div>
//             {/* Franchise Form */}
//             <div>
//               <Card className="p-10 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
//                 <h3 className="text-2xl font-bold mb-6 text-center text-accent tracking-tight">
//                   BECOME A FRANCHISE PARTNER
//                 </h3>
//                 <p className="text-gray-300 text-center mb-6">
//                   Join our network and start your own Wheelyfix Automotive franchise
//                 </p>
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <Input placeholder="Full Name" className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent" />
//                   <Input placeholder="Email Address" className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent" />
//                   <Input placeholder="Phone Number" className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent" />
//                   <Select>
//                     <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-accent">
//                       <SelectValue placeholder="Select State" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="haryana">Haryana</SelectItem>
//                       <SelectItem value="delhi">Delhi</SelectItem>
//                       <SelectItem value="punjab">Punjab</SelectItem>
//                       <SelectItem value="up">Uttar Pradesh</SelectItem>
//                       <SelectItem value="rajasthan">Rajasthan</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Select>
//                     <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-accent">
//                       <SelectValue placeholder="Vehicle Type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="2wheeler">2 Wheeler</SelectItem>
//                       <SelectItem value="4wheeler">4 Wheeler</SelectItem>
//                       <SelectItem value="both">Both</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Select>
//                     <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-accent">
//                       <SelectValue placeholder="Investment Range" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="75000">₹75,000 - ₹1,00,000</SelectItem>
//                       <SelectItem value="100000">₹1,00,000 - ₹1,50,000</SelectItem>
//                       <SelectItem value="150000">₹1,50,000 - ₹2,00,000</SelectItem>
//                       <SelectItem value="200000">₹2,00,000+</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <Button className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 text-lg rounded-lg shadow">
//                   Send Application
//                 </Button>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Footer Links */}
//       <div className="border-t border-white/20 py-14 relative z-10">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-5 gap-10">
//             <div className="md:col-span-2">
//               <div className="flex items-center space-x-3 mb-4">
//                 <img src={wheelyfixLogo} alt="Wheelyfix Automotive" className="h-8 w-8 rounded" />
//                 <span className="text-xl font-bold">WHEELYFIX</span>
//               </div>
//               <p className="text-gray-300 mb-4 max-w-md">
//                 India's leading automotive service network with 500+ centers across the country. 
//                 We provide professional car and bike services with genuine parts.
//               </p>
//               <div className="flex space-x-4 mt-2">
//                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent transition-colors duration-200">
//                   <Facebook className="h-5 w-5" />
//                 </Button>
//                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent transition-colors duration-200">
//                   <Twitter className="h-5 w-5" />
//                 </Button>
//                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent transition-colors duration-200">
//                   <Instagram className="h-5 w-5" />
//                 </Button>
//                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent transition-colors duration-200">
//                   <Linkedin className="h-5 w-5" />
//                 </Button>
//                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent transition-colors duration-200">
//                   <Youtube className="h-5 w-5" />
//                 </Button>
//               </div>
//             </div>
            // <div>
            //   <h4 className="font-semibold mb-4 text-accent">Services</h4>
            //   <div className="space-y-2 text-sm">
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Car Service</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Bike Service</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">AC Service</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Battery Service and </Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Brake Service.</Button>
            //   </div>
            // </div>
            // <div>
            //   <h4 className="font-semibold mb-4 text-accent">Company</h4>
            //   <div className="space-y-2 text-sm">
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">About Us</Button>
            //       <br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Careers</Button>
            //     <br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Franchise</Button>
            //     <br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Contact Us</Button>
            //     <br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Blog</Button>
            //   </div>
            // </div>
            // <div>
            //   <h4 className="font-semibold mb-4 text-accent">Support</h4>
            //   <div className="space-y-2 text-sm">
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Help Center</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Book Service</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Track Service</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">FAQ</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Privacy Policy</Button><br />
            //     <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Terms of Service</Button>
            //   </div>
            // </div>
//           </div>
//         </div>
//       </div>
//       {/* Copyright */}
//       <div className="border-t border-white/20 py-8 relative z-10">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
//             <p className="text-sm text-gray-400">
//               © 2025 Wheelyfix Automotive. All Rights Reserved by Corpjack Technologies
//             </p>
//             <div className="flex items-center space-x-6 text-sm text-gray-400">
//               {/* <span>ISO 9001:2015 Certified</span> */}
//               <span>•</span>
//               {/* <span>GST No: 06AADCR1234Z1Z5</span> */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import logoImage from "../assets/logo.jpg";

const Footer = () => {
  return (
    // ✅ id + scroll-mt so sticky header won't cover on smooth scroll
    <footer
      id="footer"
      className="bg-gradient-to-tr from-gray-900 via-gray-950 to-gray-900 text-white relative overflow-hidden scroll-mt-28"
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            "radial-gradient(circle at 20% 40%, #ff6b35 0%, transparent 70%)",
        }}
      />

      {/* Contact and Franchise Section */}
      <div className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-10">
              <div className="flex items-center space-x-4 mb-8">
                <img
                  src={logoImage}
                  alt="Wheelyfix Automotive"
                  className="h-14 w-14 rounded-lg shadow-lg"
                />
                <div>
                  <span className="text-3xl font-extrabold tracking-tight">
                    WHEELYFIX
                  </span>
                  <div className="text-base text-gray-400 font-medium">
                    Wheelyfix Automotive
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-accent">GET IN TOUCH</h3>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 leading-relaxed">
                        WHEELYFIX AUTOMOTIVE
                        <br />
                        4/43, Sector 5, Rajinder Nagar
                        <br />
                        Ghaziabad Uttar Pradesh 201005
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-accent" />
                    <div>
                      <p className="text-xl font-semibold text-accent">
                        +91 8700665747
                      </p>
                      <p className="text-sm text-gray-400">Toll Free Number</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-accent" />
                    <p className="text-gray-300">wheelyfix@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Franchise Form */}
            <div>
              <Card className="p-10 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center text-accent tracking-tight">
                  BECOME A FRANCHISE PARTNER
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Join our network and start your own Wheelyfix Automotive
                  franchise
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Input
                    placeholder="Full Name"
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent"
                  />
                  <Input
                    placeholder="Email Address"
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent"
                  />
                  <Input
                    placeholder="Phone Number"
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-accent"
                  />

                  <Select>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-accent">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haryana">Haryana</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="punjab">Punjab</SelectItem>
                      <SelectItem value="up">Uttar Pradesh</SelectItem>
                      <SelectItem value="rajasthan">Rajasthan</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-accent">
                      <SelectValue placeholder="Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2wheeler">2 Wheeler</SelectItem>
                      <SelectItem value="4wheeler">4 Wheeler</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-accent">
                      <SelectValue placeholder="Investment Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="75000">
                        ₹75,000 - ₹1,00,000
                      </SelectItem>
                      <SelectItem value="100000">
                        ₹1,00,000 - ₹1,50,000
                      </SelectItem>
                      <SelectItem value="150000">
                        ₹1,50,000 - ₹2,00,000
                      </SelectItem>
                      <SelectItem value="200000">₹2,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 text-lg rounded-lg shadow">
                  Send Application
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-white/20 py-14 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Brand blurb + Social */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={logoImage}
                  alt="Wheelyfix Automotive"
                  className="h-8 w-8 rounded"
                />
                <span className="text-xl font-bold">WHEELYFIX</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                India's leading automotive service network with 500+ centers
                across the country. We provide professional car and bike
                services with genuine parts.
              </p>
              <div className="flex space-x-4 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-accent transition-colors duration-200"
                >
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-accent">Services</h4>
              <div className="space-y-2 text-sm">
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Car Service</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Bike Service</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">AC Service</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Battery Service</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Brake Service</Button>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-accent">Company</h4>
              <div className="space-y-2 text-sm">
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">About Us</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Careers</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Franchise</Button><br />
                {/* ✅ "Contact Us" does nothing here (no navigation) */}
                <Button
                  variant="link"
                  className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact Us
                </Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Blog</Button>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-accent">Support</h4>
              <div className="space-y-2 text-sm">
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Help Center</Button><br />
                {/* Book Service link removed - booking only available from homepage */}<br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Track Service</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">FAQ</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Privacy Policy</Button><br />
                <Button variant="link" className="p-0 h-auto text-gray-300 hover:text-accent justify-start transition-colors duration-200">Terms of Service</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2025 Wheelyfix Automotive. All Rights Reserved by Corpjack Technologies
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>•</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
