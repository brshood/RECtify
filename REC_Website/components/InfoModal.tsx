import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Shield, 
  Globe, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  Award, 
  Building2, 
  Factory, 
  Users, 
  ArrowRight,
  Leaf,
  DollarSign,
  FileText,
  Target
} from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterPlatform: () => void;
}

export function InfoModal({ isOpen, onClose, onEnterPlatform }: InfoModalProps) {
  const keyFeatures = [
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "Every certificate transaction is secured and immutable"
    },
    {
      icon: Globe,
      title: "UAE Compliant", 
      description: "Fully compliant with UAE Climate Law and international standards"
    },
    {
      icon: TrendingUp,
      title: "Real-time Trading",
      description: "Live market data and instant settlement capabilities"
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "Fair market pricing with no hidden fees or commissions"
    }
  ];

  const beneficiaries = [
    {
      icon: Building2,
      title: "Large Enterprises",
      description: "Meet ESG goals and Scope 2 emission requirements",
      benefits: ["Carbon neutrality certification", "ESG compliance reporting", "Bulk trading options"]
    },
    {
      icon: Factory,
      title: "Renewable Generators", 
      description: "Monetize renewable energy production efficiently",
      benefits: ["Direct market access", "Competitive pricing", "Automated settlement"]
    },
    {
      icon: Users,
      title: "SMEs & Individuals",
      description: "Accessible sustainability solutions for all",
      benefits: ["Flexible purchase options", "Personal impact tracking", "Community recognition"]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-center">
            About <span className="text-rectify-gradient">RECtify</span> & I-RECs
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Learn about International Renewable Energy Certificates and how RECtify is transforming renewable energy trading in the UAE
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 mt-6">
          {/* What are I-RECs Section */}
          <Card className="border-rectify-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-rectify-green" />
                <span>What are I-RECs?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                International Renewable Energy Certificates (I-RECs) are tradable certificates that represent 
                proof that one megawatt-hour (MWh) of electricity was generated from renewable energy sources.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rectify-accent p-4 rounded-lg border border-rectify-border">
                  <h4 className="font-medium text-rectify-green mb-2">For Buyers</h4>
                  <p className="text-sm text-muted-foreground">
                    Purchase I-RECs to offset your electricity consumption and achieve carbon neutrality goals.
                  </p>
                </div>
                <div className="bg-rectify-accent p-4 rounded-lg border border-rectify-border">
                  <h4 className="font-medium text-rectify-green mb-2">For Generators</h4>
                  <p className="text-sm text-muted-foreground">
                    Sell I-RECs to create additional revenue streams from your renewable energy production.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UAE Context */}
          <Card className="border-rectify-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-rectify-blue" />
                <span>UAE's Renewable Energy Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Badge Grid with Proper Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center space-y-4 p-4 rounded-lg bg-rectify-surface border border-rectify-border">
                  <Badge className="bg-rectify-green text-white px-4 py-2 text-sm whitespace-nowrap text-[7px] p-[7px] px-[10px] py-[7px]">
                    Vision 2050
                  </Badge>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Net Zero Emissions by 2050</p>
                    <p className="text-xs text-muted-foreground">
                      UAE's commitment to carbon neutrality
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-4 p-4 rounded-lg bg-rectify-surface border border-rectify-border">
                  <Badge className="bg-rectify-blue text-white px-4 py-2 text-sm whitespace-nowrap text-[7px] p-[7px] mt-[0px] mr-[0px] mb-[14px] ml-[0px]">
                    Energy Strategy 2050
                  </Badge>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">50% Clean Energy Mix</p>
                    <p className="text-xs text-muted-foreground">
                      Diversified energy portfolio goals
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-4 p-4 rounded-lg bg-rectify-surface border border-rectify-border sm:col-span-2 lg:col-span-1">
                  <Badge className="bg-rectify-gradient text-white px-4 py-2 text-sm whitespace-nowrap p-[7px] text-[7px]">
                    Climate Law 2024
                  </Badge>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Federal Decree-Law No. 11</p>
                    <p className="text-xs text-muted-foreground">
                      Legal framework for climate action
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Separator and Description */}
              <Separator className="my-6" />
              <div className="bg-rectify-accent/50 p-6 rounded-lg border border-rectify-border">
                <p className="text-muted-foreground text-center leading-relaxed">
                  RECtify supports the UAE's ambitious climate goals by providing the digital infrastructure 
                  needed for efficient renewable energy certificate trading, helping accelerate the transition 
                  to clean energy across all sectors.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Features */}
          <Card className="border-rectify-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-rectify-green" />
                <span>RECtify Platform Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-rectify-accent/30 border border-rectify-border">
                    <div className="p-3 rounded-lg bg-rectify-gradient-light border border-rectify-border">
                      <feature.icon className="h-5 w-5 text-rectify-green" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Who Benefits */}
          <Card className="border-rectify-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-rectify-blue" />
                <span>Who Benefits from RECtify?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="p-6 rounded-lg bg-rectify-surface border border-rectify-border">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 rounded-lg bg-rectify-gradient-light border border-rectify-border">
                        <beneficiary.icon className="h-6 w-6 text-rectify-green" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{beneficiary.title}</h4>
                        <p className="text-sm text-muted-foreground">{beneficiary.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-4">
                      {beneficiary.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <CheckCircle className="h-4 w-4 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    {index < beneficiaries.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="border-rectify-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-rectify-green" />
                <span>How RECtify Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Register", desc: "Create your account and complete verification" },
                  { step: "2", title: "Browse", desc: "Explore available I-RECs from UAE generators" },
                  { step: "3", title: "Trade", desc: "Buy or sell certificates at market prices" },
                  { step: "4", title: "Verify", desc: "Receive blockchain-verified certificates" }
                ].map((item, index) => (
                  <div key={index} className="text-center p-4 rounded-[10px] bg-rectify-accent/30 border border-rectify-border px-[10px] py-[14px] px-[3px]">
                    <div className="w-12 h-12 rounded-full bg-rectify-gradient text-white flex items-center justify-center mx-auto mb-4 font-medium">
                      {item.step}
                    </div>
                    <h4 className="font-medium mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground p-[0px] text-[11px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="border-rectify-border bg-rectify-gradient-light">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <Leaf className="h-12 w-12 text-rectify-green mx-auto" />
                <div className="space-y-4">
                  <h3 className="text-xl">Ready to Start Your Sustainability Journey?</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Join RECtify today and become part of the UAE's renewable energy future. 
                    Whether you're looking to offset your carbon footprint or monetize your renewable generation, 
                    we have the tools you need.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    className="bg-rectify-gradient hover:opacity-90 text-white px-6 py-3"
                    onClick={onEnterPlatform}
                  >
                    Start Trading Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-rectify-border hover:bg-rectify-accent px-6 py-3"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}