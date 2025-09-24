import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Zap, 
  Calendar,
  Building,
  Globe,
  Lock,
  Verified,
  ExternalLink,
  Download,
  Eye,
  X,
  Plus,
  Link,
  Database,
  Users,
  ArrowRight,
  Info
} from "lucide-react";
import { toast } from "sonner";
import apiService from "../services/api";

interface RegistrationOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  requirements: string[];
  benefits: string[];
  status: 'available' | 'coming-soon';
}

interface RegistrationData {
  selectedOption: string;
  facilityName: string;
  technology: string;
  capacity: string;
  location: string;
  emirate: string;
  owner: string;
  operator: string;
  documents: DocumentFile[];
}

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
  file?: File;
  uploadDate?: string;
}

export default function RECRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    selectedOption: "",
    facilityName: "",
    technology: "",
    capacity: "",
    location: "",
    emirate: "",
    owner: "",
    operator: "",
    documents: []
  });

  const [requiredDocuments, setRequiredDocuments] = useState<DocumentFile[]>([
    {
      id: "1",
      name: "Facility Registration Certificate",
      type: "pdf",
      size: 0,
      status: "pending",
      required: true
    },
    {
      id: "2",
      name: "Environmental Impact Assessment",
      type: "pdf",
      size: 0,
      status: "pending",
      required: true
    },
    {
      id: "3",
      name: "Grid Connection Agreement",
      type: "pdf",
      size: 0,
      status: "pending",
      required: true
    },
    {
      id: "4",
      name: "Technology Specifications",
      type: "pdf",
      size: 0,
      status: "pending",
      required: true
    }
  ]);

  const registrationOptions: RegistrationOption[] = [
    {
      id: "link-existing",
      title: "Link Existing RECs",
      description: "Connect your existing RECs from official registries to start trading immediately",
      icon: <Link className="h-6 w-6" />,
      estimatedTime: "5 minutes",
      status: 'coming-soon',
      requirements: [
        "Existing RECs in I-REC Registry",
        "Registry account credentials",
        "Facility ownership documentation"
      ],
      benefits: [
        "Immediate trading access",
        "No verification delays",
        "Full platform integration"
      ]
    },
    {
      id: "register-new",
      title: "Register New Facility",
      description: "Register your renewable energy facility and get RECs verified through our partners",
      icon: <Building className="h-6 w-6" />,
      estimatedTime: "2-3 weeks",
      status: 'available',
      requirements: [
        "Facility documentation",
        "Environmental permits",
        "Grid connection agreements",
        "Third-party verification"
      ],
      benefits: [
        "Full verification process",
        "I-REC standard compliance",
        "Blockchain tokenization",
        "Trading platform access"
      ]
    },
    {
      id: "aggregator-service",
      title: "Aggregator Service",
      description: "Let us handle the entire registration process through our network of partners",
      icon: <Users className="h-6 w-6" />,
      estimatedTime: "1-2 weeks",
      status: 'coming-soon',
      requirements: [
        "Power of attorney",
        "Facility access for inspection",
        "Generation data access"
      ],
      benefits: [
        "End-to-end service",
        "Expert guidance",
        "Faster processing",
        "Reduced complexity"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
      case 'uploaded':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed':
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
      case 'uploaded':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (currentStep === 1) return 0;
    if (currentStep === 2) return 25;
    if (currentStep === 3) return 50;
    if (currentStep === 4) return 75;
    if (currentStep === 5) return 100;
    return 0;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      event.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOC files are allowed');
      event.target.value = '';
      return;
    }

    setRequiredDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? {
            ...doc,
            status: 'uploaded' as const,
            file: file,
            size: file.size,
            uploadDate: new Date().toISOString().split('T')[0]
          }
        : doc
    ));
  };

  const handleFileRemove = (docId: string) => {
    setRequiredDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? {
            ...doc,
            status: 'pending' as const,
            file: undefined,
            size: 0,
            uploadDate: undefined
          }
        : doc
    ));
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedOption) {
      toast.error('Please select a registration option');
      return;
    }
    if (currentStep === 2) {
      const required = ['facilityName', 'technology', 'capacity', 'location', 'emirate', 'owner'];
      const missing = required.filter(field => !registrationData[field as keyof RegistrationData]);
      if (missing.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 3) {
      const uploadedDocs = requiredDocuments.filter(doc => doc.required && doc.status === 'uploaded').length;
      const totalRequired = requiredDocuments.filter(doc => doc.required).length;
      if (uploadedDocs < totalRequired) {
        toast.error('Please upload all required documents');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Prepare registration data for API submission
      const registrationPayload = {
        selectedOption,
        facilityName: registrationData.facilityName,
        technology: registrationData.technology,
        capacity: parseFloat(registrationData.capacity),
        location: registrationData.location,
        emirate: registrationData.emirate,
        owner: registrationData.owner,
        operator: registrationData.operator,
        documents: requiredDocuments.filter(doc => doc.status === 'uploaded').map(doc => ({
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadDate: doc.uploadDate
        }))
      };

      // Submit registration (this would connect to the backend API)
      // For now, we'll simulate the API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Registration submitted successfully' });
        }, 1000);
      });

      if (response.success) {
        toast.success('Registration submitted successfully! You will receive updates via email.');
        
        // Reset form
        setCurrentStep(1);
        setSelectedOption("");
        setRegistrationData({
          selectedOption: "",
          facilityName: "",
          technology: "",
          capacity: "",
          location: "",
          emirate: "",
          owner: "",
          operator: "",
          documents: []
        });
        
        // Reset documents
        setRequiredDocuments(prev => prev.map(doc => ({
          ...doc,
          status: 'pending' as const,
          file: undefined,
          size: 0,
          uploadDate: undefined
        })));
      }
    } catch (error: any) {
      console.error('Registration submission error:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Your Registration Path</h2>
              <p className="text-muted-foreground">
                Select how you'd like to get started with REC registration and trading
              </p>
            </div>
            
            <div className="grid gap-4">
              {registrationOptions.map((option) => (
                <Card 
                  key={option.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedOption === option.id ? 'ring-2 ring-rectify-green bg-green-50' : ''
                  } ${option.status === 'coming-soon' ? 'opacity-60' : ''}`}
                  onClick={() => {
                    if (option.status === 'available') {
                      setSelectedOption(option.id);
                    } else if (option.status === 'coming-soon') {
                      toast.info('I-REC and other APIs coming soon!');
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        selectedOption === option.id ? 'bg-rectify-green text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{option.title}</h3>
                          <div className="flex items-center space-x-2">
                            {option.status === 'coming-soon' && (
                              <Badge variant="secondary">Coming Soon</Badge>
                            )}
                            <Badge variant="outline">{option.estimatedTime}</Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-1">{option.description}</p>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {option.requirements.map((req, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {option.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Facility Information</h2>
              <p className="text-muted-foreground">
                Provide basic information about your renewable energy facility
              </p>
            </div>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facility-name">Facility Name *</Label>
                    <Input 
                      id="facility-name"
                      placeholder="e.g., Al Dhafra Solar PV Plant"
                      value={registrationData.facilityName}
                      onChange={(e) => setRegistrationData({...registrationData, facilityName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="technology">Technology Type *</Label>
                    <Select value={registrationData.technology} onValueChange={(value) => 
                      setRegistrationData({...registrationData, technology: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technology" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solar-pv">Solar PV</SelectItem>
                        <SelectItem value="csp">Concentrated Solar Power</SelectItem>
                        <SelectItem value="wind">Wind Power</SelectItem>
                        <SelectItem value="nuclear">Nuclear Power</SelectItem>
                        <SelectItem value="hydro">Hydroelectric</SelectItem>
                        <SelectItem value="biomass">Biomass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Installed Capacity (MW) *</Label>
                    <Input 
                      id="capacity"
                      type="number"
                      placeholder="e.g., 2000"
                      value={registrationData.capacity}
                      onChange={(e) => setRegistrationData({...registrationData, capacity: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emirate">Emirate *</Label>
                    <Select value={registrationData.emirate} onValueChange={(value) => 
                      setRegistrationData({...registrationData, emirate: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emirate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abu-dhabi">Abu Dhabi</SelectItem>
                        <SelectItem value="dubai">Dubai</SelectItem>
                        <SelectItem value="sharjah">Sharjah</SelectItem>
                        <SelectItem value="ajman">Ajman</SelectItem>
                        <SelectItem value="fujairah">Fujairah</SelectItem>
                        <SelectItem value="ras-al-khaimah">Ras Al Khaimah</SelectItem>
                        <SelectItem value="umm-al-quwain">Umm Al Quwain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Detailed Location *</Label>
                    <Input 
                      id="location"
                      placeholder="e.g., Sweihan, Abu Dhabi"
                      value={registrationData.location}
                      onChange={(e) => setRegistrationData({...registrationData, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner">Facility Owner *</Label>
                    <Input 
                      id="owner"
                      placeholder="e.g., ADNOC Clean Energy"
                      value={registrationData.owner}
                      onChange={(e) => setRegistrationData({...registrationData, owner: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operator">Facility Operator</Label>
                    <Input 
                      id="operator"
                      placeholder="e.g., Masdar Clean Energy"
                      value={registrationData.operator}
                      onChange={(e) => setRegistrationData({...registrationData, operator: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Required Documents</h2>
              <p className="text-muted-foreground">
                Upload the necessary documentation for your facility registration
              </p>
            </div>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(doc.status)}`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{doc.name}</span>
                            {doc.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{doc.type.toUpperCase()}</span>
                            <span>{doc.size > 0 ? formatFileSize(doc.size) : 'No file'}</span>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(doc.status)}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </Badge>
                          </div>
                          {doc.uploadDate && (
                            <p className="text-xs text-green-600">Uploaded: {doc.uploadDate}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.status === 'pending' && (
                          <div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                              className="hidden"
                              id={`file-upload-${doc.id}`}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById(`file-upload-${doc.id}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                          </div>
                        )}
                        {doc.status === 'uploaded' && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFileRemove(doc.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Verification Partners</h2>
              <p className="text-muted-foreground">
                Our network of accredited verification bodies will handle your registration
              </p>
            </div>
            
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">I-REC Registry</h3>
                      <p className="text-sm text-muted-foreground">International REC Standard Registry</p>
                      <p className="text-sm mt-1">Your facility will be registered with the I-REC Standard, ensuring global recognition and compliance.</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Partner</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Verified className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Third-Party Verification</h3>
                      <p className="text-sm text-muted-foreground">Accredited Verification Bodies</p>
                      <p className="text-sm mt-1">Independent verification by ISO 14065 accredited bodies including SGS, TÜV SÜD, and DNV.</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Lock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Blockchain Integration</h3>
                      <p className="text-sm text-muted-foreground">Smart Contract & Tokenization</p>
                      <p className="text-sm mt-1">Your RECs will be tokenized on blockchain with immutable provenance and instant trading capabilities.</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Secure</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                All verification processes are conducted by accredited independent bodies. 
                RECtify does not charge additional fees for third-party verification services.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Review & Submit</h2>
              <p className="text-muted-foreground">
                Review your registration details and submit for processing
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Selected Option</h4>
                    <p className="text-sm text-muted-foreground">
                      {registrationOptions.find(opt => opt.id === selectedOption)?.title}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Facility Name</h4>
                    <p className="text-sm text-muted-foreground">{registrationData.facilityName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technology</h4>
                    <p className="text-sm text-muted-foreground">{registrationData.technology}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Capacity</h4>
                    <p className="text-sm text-muted-foreground">{registrationData.capacity} MW</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-sm text-muted-foreground">{registrationData.location}, {registrationData.emirate}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Owner</h4>
                    <p className="text-sm text-muted-foreground">{registrationData.owner}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {requiredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-sm">
                        <span>{doc.name}</span>
                        <Badge variant={doc.status === 'uploaded' ? 'default' : 'secondary'}>
                          {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-rectify-green" />
          <div>
            <h1 className="text-2xl font-bold">REC Registration</h1>
            <p className="text-muted-foreground">
              Register your renewable energy facility and start trading RECs on our platform
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Registration Progress</span>
              <span>{calculateProgress()}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep} of 5</span>
              <span>
                {currentStep === 1 && "Choose Option"}
                {currentStep === 2 && "Facility Info"}
                {currentStep === 3 && "Documents"}
                {currentStep === 4 && "Verification"}
                {currentStep === 5 && "Review"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep < 5 ? (
              <Button 
                onClick={handleNext}
                className="bg-rectify-green hover:bg-rectify-green-dark"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-rectify-green hover:bg-rectify-green-dark"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Registration
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

