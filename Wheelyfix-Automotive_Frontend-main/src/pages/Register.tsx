import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ChevronLeft, ChevronRight, User, Mail, Lock, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Contact Details" },
    { number: 3, title: "Security" },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // normalize inputs a bit
    const next = name === "email" ? value.trim().toLowerCase() : value;
    setFormData((prev) => ({ ...prev, [name]: next }));
  };

  const validateStep = (step: number): boolean => {
    // mirror backend rules per step
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError("First and last name are required");
        return false;
      }
    }
    if (step === 2) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      const phoneOk = /^[0-9]{10}$/.test(formData.phoneNumber);
      if (!emailOk) {
        setError("Please enter a valid email address");
        return false;
      }
      if (!phoneOk) {
        setError("Please enter a valid ten digit phone number");
        return false;
      }
      if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
        setError("Complete address is required");
        return false;
      }
    }
    if (step === 3) {
      if (formData.password.length < 6) {
        setError("Password must be at least six characters long");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3 && validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setError("");
    setLoading(true);

    try {
      const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const payload = {
        name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        // vehicles optional: send empty list by default
        vehicles: [],
      };

      // Use axios client via Vite proxy for consistent network behavior
      await authService.registerFull(payload);
      navigate("/login");
    } catch (err) {
      // Handle error messages from server or network
      const msg = (err as any)?.message || "Registration failed. Please try again.";
      setError(msg);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-2xl w-full px-8 py-10 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    currentStep >= step.number
                      ? "border-primary-600 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <span
                  className={`text-sm mt-2 font-medium ${
                    currentStep >= step.number ? "text-primary-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Step 1: Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 1 ? 1 : 0, x: currentStep === 1 ? 0 : 20 }}
            className={currentStep === 1 ? "block" : "hidden"}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <div className="mt-2 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="John"
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <div className="mt-2 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 2 ? 1 : 0, x: currentStep === 2 ? 0 : 20 }}
            className={currentStep === 2 ? "block" : "hidden"}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="mt-2 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      // allow only digits
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData((p) => ({ ...p, phoneNumber: digits }));
                    }}
                    className="pl-10"
                    placeholder="9876543210"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <div className="mt-2 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="123 Main Street"
                      autoComplete="address-line1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    autoComplete="address-level1"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={formData.pincode}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData((p) => ({ ...p, pincode: digits }));
                    }}
                    placeholder="400001"
                    autoComplete="postal-code"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Security */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 3 ? 1 : 0, x: currentStep === 3 ? 0 : 20 }}
            className={currentStep === 3 ? "block" : "hidden"}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2 ${currentStep === 1 ? "opacity-50" : ""}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="px-6 py-2 bg-primary-600 hover:bg-primary-700">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign in instead
          </Link>
        </p>
      </Card>
    </div>
  );
}