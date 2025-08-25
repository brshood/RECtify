import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, Leaf, Globe, Shield, TrendingUp, Zap, CheckCircle, Award, Users, Building2, GraduationCap, Briefcase, Factory, Store, Heart, Sun, Wind, Mail, Phone, MapPin, Send, X, FileText } from "lucide-react";
// Placeholder images - replace with actual images when available
const image_94a3247396ceec0e6396f554452975e037b47a14 = "/placeholder-1.png";
const image_8074d3680bed84eb87667c02ef0886cffd5ae6ef = "/placeholder-2.png";
const rectifyLogo = "/logo-icon.png";
const khaledImage = "/khaled-placeholder.png";
const rashedImage = "/rashed-placeholder.png";
import { InfoModal } from "./InfoModal";
import { useState } from "react";
import { motion } from "framer-motion";

interface LandingPageProps {
  onEnterPlatform: () => void;
  onNavigateToEIReports: () => void;
}

export function LandingPage({ onEnterPlatform, onNavigateToEIReports }: LandingPageProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const features = [
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "Every I-REC transaction is secured and verified on blockchain technology"
    },
    {
      icon: Globe,
      title: "UAE Market Focus",
      description: "Tailored specifically for the UAE renewable energy market and regulations"
    },
    {
      icon: TrendingUp,
      title: "Real-time Trading",
      description: "Live market data and instant trading capabilities for I-RECs"
    },
    {
      icon: CheckCircle,
      title: "Compliance Ready",
      description: "Built-in compliance with UAE Climate Law and international standards"
    }
  ];

  const generatorTypes = [
    {
      icon: Factory,
      title: "Utility-Scale Facilities",
      subtitle: "Large Renewable Energy Projects",
      description: "Maximize revenue from your renewable energy certificates with direct market access",
      features: ["Direct Market Access", "Transparent Pricing", "Instant Settlement", "Portfolio Management"],
      highlight: "Industrial Scale"
    },
    {
      icon: Sun,
      title: "Distributed Generators",
      subtitle: "Home & Commercial Solar Owners",
      description: "Turn your rooftop solar into additional income through I-REC monetization",
      features: ["Easy Registration", "Automated Certificate Generation", "Competitive Rates", "Simple Integration"],
      highlight: "Home & Business"
    }
  ];

  const customerSegments = [
    {
      icon: Building2,
      title: "Large Enterprises",
      subtitle: "Corporations & Government Entities",
      description: "Meet sustainability mandates and ESG commitments with verified renewable energy certificates",
      features: ["ESG Compliance Reporting", "Carbon Neutral Certification", "Scope 2 Emission Offsetting", "Bulk Trading Capabilities"],
      highlight: "Enterprise Solutions"
    },
    {
      icon: Store,
      title: "Small & Medium Enterprises",
      subtitle: "Growing Businesses",
      description: "Accessible green energy solutions for businesses committed to sustainable growth",
      features: ["Flexible Purchase Options", "Sustainability Certification", "Competitive Pricing", "Easy Integration"],
      highlight: "SME Friendly"
    },
    {
      icon: Heart,
      title: "Individual Contributors",
      subtitle: "Environmental Champions",
      description: "Empower individuals to make a direct impact on the planet's sustainable future",
      features: ["Personal Carbon Offset", "Certificate Ownership", "Environmental Impact Tracking", "Community Recognition"],
      highlight: "Personal Impact"
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally send the data to your backend
    // For now, we'll just show the success popup and reset the form
    setShowSuccessPopup(true);
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Auto-hide the popup after 5 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-rectify-accent via-background to-rectify-blue-light/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-rectify-gradient-light opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.2 }}
        ></motion.div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img 
                src={rectifyLogo} 
                alt="RECtify Logo" 
                className="h-24 w-auto"
              />
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              className="text-4xl md:text-6xl mb-6 text-foreground leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              UAE's First Digital{" "}
              <span className="text-rectify-gradient">I-REC</span>{" "}
              Trading Platform
            </motion.h1>
            
            {/* Arabic Text */}
            <motion.div 
              className="text-2xl md:text-3xl mb-8 text-rectify-green" 
              dir="rtl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              ريكتيفاي - منصة تداول شهادات الطاقة المتجددة الرقمية الأولى في دولة الإمارات
            </motion.div>
            
            {/* Subtitle */}
            <motion.p 
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Empowering the UAE's renewable energy future through transparent, efficient, 
              and compliant International Renewable Energy Certificate trading.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col space-y-4">
                  <Button 
                    size="lg" 
                    className="bg-rectify-gradient hover:opacity-90 text-white px-8 py-6 text-lg"
                    onClick={onEnterPlatform}
                  >
                    Enter Trading Platform
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-rectify-green text-rectify-green hover:bg-rectify-green hover:text-white px-8 py-6 text-lg"
                    onClick={onNavigateToEIReports}
                  >
                    Access EI Reports
                    <FileText className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-rectify-border hover:bg-rectify-accent px-8 py-6 text-lg"
                  onClick={() => setIsInfoModalOpen(true)}
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { value: "50M+", label: "MWh Available", color: "text-rectify-green" },
                { value: "99.9%", label: "Platform Uptime", color: "text-rectify-blue" },
                { value: "24/7", label: "Trading Available", color: "text-rectify-green" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <motion.section 
        className="py-20 bg-rectify-surface"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-rectify-green-light text-rectify-green-dark mb-4">Our Mission</Badge>
            </motion.div>
            <h2 className="text-3xl md:text-4xl mb-6">
              Advancing UAE's <span className="text-rectify-gradient">Net Zero 2050</span> Vision
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              RECtify bridges the gap between renewable energy generation and corporate sustainability goals, 
              creating a transparent marketplace that accelerates the UAE's transition to clean energy.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-rectify-border hover:shadow-lg transition-all duration-300 bg-rectify-surface group">
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardHeader className="text-center pb-4">
                      <motion.div 
                        className="mx-auto mb-4 p-3 rounded-full bg-rectify-gradient-light group-hover:bg-rectify-gradient transition-colors duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <feature.icon className="h-6 w-6 text-rectify-green group-hover:text-white transition-colors duration-300" />
                      </motion.div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">{feature.description}</p>
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Generators Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-rectify-green-light/20 via-background to-rectify-blue-light/20 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-rectify-gradient text-white mb-4 shadow-lg">For Generators</Badge>
            </motion.div>
            <h2 className="text-3xl md:text-4xl mb-6">
              Monetize Your <span className="text-rectify-gradient">Renewable Energy</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you operate utility-scale facilities or own rooftop solar, RECtify provides the digital 
              infrastructure to efficiently monetize your renewable energy certificates.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.3 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {generatorTypes.map((generator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="border-2 border-rectify-green/20 bg-rectify-surface hover:shadow-2xl hover:border-rectify-green/40 transition-all duration-500 group relative overflow-hidden">
                  {/* Card accent border */}
                  <motion.div 
                    className="absolute top-0 left-0 right-0 h-1 bg-rectify-gradient"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.3 }}
                    viewport={{ once: true }}
                  ></motion.div>
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <motion.div 
                        className="p-4 rounded-2xl bg-rectify-gradient shadow-lg group-hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <generator.icon className="h-8 w-8 text-white transition-colors duration-300" />
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Badge 
                        className="mb-3 bg-rectify-green text-white shadow-md"
                      >
                        {generator.highlight}
                      </Badge>
                    </motion.div>
                    <CardTitle className="text-2xl mb-2">{generator.title}</CardTitle>
                    <p className="text-sm text-rectify-blue font-medium">{generator.subtitle}</p>
                    <p className="text-muted-foreground mt-4">{generator.description}</p>
                  </CardHeader>
                  <CardContent>
                    <motion.ul 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.3 + 0.4 }}
                      viewport={{ once: true }}
                    >
                      {generator.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.3 + idx * 0.1 + 0.5 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                        >
                          <CheckCircle className="h-5 w-5 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                    <div className="mt-6 pt-6 border-t border-rectify-border">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full bg-rectify-gradient hover:opacity-90 text-white transition-all duration-300"
                        >
                          Get Started
                          <Zap className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Generator Benefits */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-rectify-surface p-8 rounded-2xl border-2 border-rectify-green/30 shadow-xl max-w-4xl mx-auto relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background pattern */}
              <motion.div 
                className="absolute top-0 left-0 right-0 h-2 bg-rectify-gradient"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
              
              <div className="text-center relative">
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="p-3 rounded-full bg-rectify-gradient shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </motion.div>
                </motion.div>
                <motion.h3 
                  className="text-2xl mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Why Choose RECtify for Energy Generation?
                </motion.h3>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {[
                    {
                      title: "Direct Market Access",
                      description: "Skip intermediaries and connect directly with buyers for better margins"
                    },
                    {
                      title: "Transparent Pricing", 
                      description: "Real-time market pricing with full transparency and no hidden fees"
                    },
                    {
                      title: "Instant Settlement",
                      description: "Fast, automated transactions with blockchain-verified certificates"
                    }
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="p-4 rounded-lg bg-rectify-accent border border-rectify-border"
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <h4 className="font-medium text-rectify-green mb-2">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom border accent */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-[rgba(200,231,207,0.12)]"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        ></motion.div>
      </motion.section>

      {/* Customer Segments Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-rectify-blue-light text-rectify-blue-dark mb-4">Who We Serve</Badge>
            </motion.div>
            <h2 className="text-3xl md:text-4xl mb-6">
              Empowering Every <span className="text-rectify-gradient">Sustainability Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From large corporations to individual environmental champions, RECtify serves all who are committed 
              to making a positive impact on our planet's future.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            {customerSegments.map((segment, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-rectify-border bg-rectify-surface hover:shadow-xl transition-all duration-500 group h-full">
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <motion.div 
                        className="p-4 rounded-2xl bg-rectify-gradient-light group-hover:bg-rectify-gradient transition-colors duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <segment.icon className="h-8 w-8 text-rectify-green group-hover:text-white transition-colors duration-300" />
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Badge 
                        className="mb-3" 
                        style={{
                          backgroundColor: index === 0 ? 'var(--rectify-green-light)' : 
                                         index === 1 ? 'var(--rectify-blue-light)' : 
                                         'var(--rectify-accent)',
                          color: index === 0 ? 'var(--rectify-green-dark)' : 
                                 index === 1 ? 'var(--rectify-blue-dark)' : 
                                 'var(--rectify-green-dark)'
                        }}
                      >
                        {segment.highlight}
                      </Badge>
                    </motion.div>
                    <CardTitle className="text-2xl mb-2">{segment.title}</CardTitle>
                    <p className="text-sm text-rectify-blue font-medium">{segment.subtitle}</p>
                    <p className="text-muted-foreground mt-4">{segment.description}</p>
                  </CardHeader>
                  <CardContent>
                    <motion.ul 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      {segment.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 + idx * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                        >
                          <CheckCircle className="h-5 w-5 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                    <div className="mt-6 pt-6 border-t border-rectify-border">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full border-rectify-border hover:bg-rectify-accent hover:border-rectify-green transition-all duration-300"
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Call to Action */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-rectify-gradient-light p-8 rounded-2xl border border-rectify-border max-w-4xl mx-auto"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3 
                className="text-2xl mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Join the Movement
              </motion.h3>
              <motion.p 
                className="text-muted-foreground mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Whether you're a multinational corporation, a growing SME, or an individual passionate about the environment, 
                RECtify provides the tools and platform to make your sustainability goals a reality.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  className="bg-rectify-gradient hover:opacity-90 text-white px-8 py-3"
                  onClick={onEnterPlatform}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* UAE Focus Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-rectify-green-light to-rectify-blue-light"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Award className="h-12 w-12 text-rectify-green" />
              </motion.div>
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Built for the UAE, Aligned with Vision 2050
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              As the UAE leads the Middle East in renewable energy adoption, RECtify provides the digital 
              infrastructure needed to support the nation's ambitious clean energy targets. Our platform 
              ensures compliance with UAE Climate Law (Federal Decree-Law No. 11 of 2024) while enabling 
              efficient market mechanisms for renewable energy certificates.
            </motion.p>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[
                {
                  icon: Leaf,
                  title: "Environmental Impact",
                  description: "Supporting the UAE's goal to achieve net-zero emissions by 2050 through transparent renewable energy certificate trading.",
                  color: "text-rectify-green"
                },
                {
                  icon: Building2,
                  title: "Economic Growth", 
                  description: "Creating new revenue streams for renewable energy projects while helping corporations meet their sustainability commitments.",
                  color: "text-rectify-blue"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="bg-rectify-surface p-6 rounded-lg border border-rectify-border"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="mb-4"
                  >
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                  </motion.div>
                  <h3 className="text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="py-20 bg-rectify-surface"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-rectify-green-light text-rectify-green-dark mb-4">Our Team</Badge>
            </motion.div>
            <h2 className="text-3xl md:text-4xl mb-6">
              Meet the <span className="text-rectify-gradient">RECtify</span> Founders
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Led by experts in renewable energy, sustainability policy, and quantitative finance, 
              our team combines deep technical knowledge with market expertise.
            </p>
          </motion.div>
          
          <div className="max-w-6xl mx-auto">
            {/* Team Member Cards */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, staggerChildren: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Khaled Alsamri */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="border-rectify-border hover:shadow-xl transition-all duration-500 bg-rectify-surface h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <motion.div 
                        className="w-24 h-24 rounded-full overflow-hidden border-4 border-rectify-gradient-light shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={image_8074d3680bed84eb87667c02ef0886cffd5ae6ef} 
                          alt="Khaled Alsamri - RECtify Founder"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                    <CardTitle className="text-2xl">Khaled Alsamri</CardTitle>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-rectify-green text-white mt-2">Founder</Badge>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="text-center mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <p className="text-lg text-rectify-blue mb-2">PhD in Mechanical & Aerospace Engineering (UCI)</p>
                      <p className="text-muted-foreground">Assistant Professor at UAEU</p>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      {[
                        "Expertise in hydrogen energy, sustainability policy, and REC markets",
                        "Led Microsoft project to offset Scope 3 emissions", 
                        "Research focus on renewable energy systems and carbon markets"
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                        >
                          <CheckCircle className="h-5 w-5 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Rashed Alneyadi */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="border-rectify-border hover:shadow-xl transition-all duration-500 bg-rectify-surface h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <motion.div 
                        className="w-24 h-24 rounded-full overflow-hidden border-4 border-rectify-gradient-light shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={image_94a3247396ceec0e6396f554452975e037b47a14} 
                          alt="Rashed Alneyadi - RECtify Founder"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                    <CardTitle className="text-2xl">Rashed Alneyadi</CardTitle>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-rectify-blue text-white mt-2">Founding Team - Strategy & Analytics Lead</Badge>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="text-center mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <p className="text-lg text-rectify-blue mb-2">BA in Mathematics (NYU)</p>
                      <p className="text-muted-foreground">ADIA & ADIC Internships</p>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      {[
                        "Quantitative finance, active investments, and market analysis",
                        "Experienced in data analytics and financial modeling",
                        "Partnership strategy and market development expertise"
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                        >
                          <CheckCircle className="h-5 w-5 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Team Mission */}
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="bg-rectify-accent p-8 rounded-lg border border-rectify-border"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3 
                  className="text-2xl mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Our Mission
                </motion.h3>
                <motion.p 
                  className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Combining deep academic research with practical market experience, our team is committed to 
                  building the infrastructure that will accelerate the UAE's transition to renewable energy. 
                  We bring together expertise in engineering, finance, and policy to create transparent, 
                  efficient markets for renewable energy certificates.
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Start Trading <span className="text-rectify-gradient">I-RECs</span>?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join the future of renewable energy trading in the UAE. Start your journey towards 
            a sustainable tomorrow today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-rectify-gradient hover:opacity-90 text-white px-12 py-6 text-lg"
              onClick={onEnterPlatform}
            >
              Access Trading Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Us Section */}
      <motion.section 
        className="py-20 bg-rectify-gradient-light"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-rectify-green text-white mb-4">Contact Us</Badge>
              </motion.div>
              <h2 className="text-3xl md:text-4xl mb-6">
                Get in Touch with <span className="text-rectify-gradient">RECtify</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Have questions about I-REC trading or want to learn more about our platform? 
                We'd love to hear from you.
              </p>
            </motion.div>
            
            {/* Horizontal Contact Form */}
            <motion.div 
              className="bg-rectify-surface p-8 rounded-2xl border border-rectify-border shadow-xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="flex items-center space-x-4 mb-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="p-3 rounded-full bg-rectify-gradient"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Mail className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-medium">Send us a message</h3>
                  <p className="text-sm text-rectify-green">We'll get back to you within 24 hours</p>
                </div>
              </motion.div>
              
              <motion.form 
                onSubmit={handleContactSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <motion.div variants={fadeInUp}>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <motion.input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-rectify-border bg-rectify-accent/30 focus:outline-none focus:ring-2 focus:ring-rectify-green focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <motion.input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-rectify-border bg-rectify-accent/30 focus:outline-none focus:ring-2 focus:ring-rectify-green focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <motion.input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-rectify-border bg-rectify-accent/30 focus:outline-none focus:ring-2 focus:ring-rectify-green focus:border-transparent transition-all duration-300"
                    placeholder="What would you like to discuss?"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <motion.textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-rectify-border bg-rectify-accent/30 focus:outline-none focus:ring-2 focus:ring-rectify-green focus:border-transparent resize-none transition-all duration-300"
                    placeholder="Tell us about your interest in I-REC trading or any questions you have..."
                    required
                    whileFocus={{ scale: 1.02 }}
                  ></motion.textarea>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      type="submit"
                      size="lg"
                      className="bg-rectify-gradient hover:opacity-90 text-white px-8 py-3"
                    >
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer with Contact Information */}
      <footer className="bg-rectify-surface border-t border-rectify-border">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={rectifyLogo} 
                    alt="RECtify Logo" 
                    className="h-8 w-auto"
                  />
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  UAE's first digital platform for trading International Renewable Energy Certificates (I-RECs). 
                  Supporting Vision 2050 and Net Zero goals through transparent, efficient renewable energy trading.
                </p>
                <div className="text-sm text-muted-foreground" dir="rtl">
                  ريكتيفاي - منصة تداول شهادات الطاقة المتجددة الرقمية الأولى في دولة الإمارات
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <h3 className="font-medium text-lg mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-rectify-green mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">RECtify</p>
                      <p className="text-sm text-muted-foreground">Abu Dhabi, UAE</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-rectify-green flex-shrink-0" />
                    <a 
                      href="tel:+971506835444" 
                      className="text-sm text-muted-foreground hover:text-rectify-green transition-colors"
                    >
                      +971 50 683 5444
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-rectify-green flex-shrink-0" />
                    <a 
                      href="mailto:alsamrikhaled@gmail.com" 
                      className="text-sm text-muted-foreground hover:text-rectify-green transition-colors"
                    >
                      alsamrikhaled@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="font-medium text-lg mb-4">Platform</h3>
                <div className="space-y-2">
                  <button 
                    onClick={onEnterPlatform}
                    className="block text-sm text-muted-foreground hover:text-rectify-green transition-colors"
                  >
                    Trading Platform
                  </button>
                  <button 
                    onClick={() => setIsInfoModalOpen(true)}
                    className="block text-sm text-muted-foreground hover:text-rectify-green transition-colors"
                  >
                    Learn About I-RECs
                  </button>
                  <div className="text-sm text-muted-foreground">Market Data</div>
                  <div className="text-sm text-muted-foreground">Documentation</div>
                </div>
              </div>
            </div>
            
            {/* Bottom Footer */}
            <div className="border-t border-rectify-border pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-muted-foreground">
                  © 2025 RECtify. Supporting UAE Vision 2050 and Net Zero 2050 goals.
                </div>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div>Privacy Policy</div>
                  <div>Terms of Service</div>
                  <div>Compliance</div>
                </div>
              </div>
              
              {/* UAE Commitment Badge */}
              <div className="text-center mt-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-rectify-accent rounded-full border border-rectify-border">
                  <Award className="h-4 w-4 text-rectify-green" />
                  <span className="text-sm text-rectify-green font-medium">
                    Committed to UAE Vision 2050 & Net Zero Goals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-rectify-surface rounded-2xl border border-rectify-border shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto mb-6 p-4 rounded-full bg-rectify-gradient w-16 h-16 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              
              {/* Success Message */}
              <div className="mb-6">
                <h3 className="text-2xl mb-3 text-rectify-green">Message Sent Successfully!</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Thank you for reaching out to RECtify. We've received your message and will get back to you 
                  at <span className="font-medium text-rectify-blue">{contactForm.email || 'your email'}</span> within 24 hours.
                </p>
              </div>
              
              {/* Contact Info Reminder */}
              <div className="bg-rectify-accent/50 p-4 rounded-lg border border-rectify-border mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  For urgent inquiries, you can also reach us directly:
                </p>
                <div className="flex flex-col space-y-1 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4 text-rectify-green" />
                    <a 
                      href="mailto:alsamrikhaled@gmail.com" 
                      className="text-rectify-blue hover:text-rectify-green transition-colors"
                    >
                      alsamrikhaled@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4 text-rectify-green" />
                    <a 
                      href="tel:+971506835444" 
                      className="text-rectify-blue hover:text-rectify-green transition-colors"
                    >
                      +971 50 683 5444
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <Button 
                onClick={() => setShowSuccessPopup(false)}
                className="bg-rectify-gradient hover:opacity-90 text-white px-6 py-3"
              >
                Continue Exploring
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              {/* Close X Button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-rectify-accent transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      <InfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onEnterPlatform={onEnterPlatform}
      />
    </motion.div>
  );
}