import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Eye
} from "lucide-react";

interface RegistrationData {
  facilityName: string;
  technology: string;
  capacity: string;
  location: string;
  country: string;
  emirate: string;
  coordinates: string;
  commissionDate: string;
  expirationDate: string;
  owner: string;
  operator: string;
  verificationBody: string;
  certificationStandard: string;
  documents: DocumentFile[];
}

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
}

interface VerificationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
  estimatedTime: string;
  completedAt?: string;
}

export default function RECRegistration() {
  const [activeTab, setActiveTab] = useState("facility");
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    facilityName: "",
    technology: "",
    capacity: "",
    location: "",
    country: "UAE",
    emirate: "",
    coordinates: "",
    commissionDate: "",
    expirationDate: "",
    owner: "",
    operator: "",
    verificationBody: "",
    certificationStandard: "",
    documents: []
  });

  const [verificationSteps] = useState<VerificationStep[]>([
    {
      id: "1",
      name: "Document Upload",
      status: "completed",
      description: "Upload all required facility and certification documents",
      estimatedTime: "5 minutes",
      completedAt: "2024-01-15 14:30:00"
    },
    {
      id: "2", 
      name: "I-REC Registry Validation",
      status: "in-progress",
      description: "I-REC Registry validates facility registration and compliance",
      estimatedTime: "2-3 business days"
    },
    {
      id: "3",
      name: "Third-Party Verification",
      status: "pending",
      description: "Independent verification body conducts facility audit",
      estimatedTime: "5-10 business days"
    },
    {
      id: "4",
      name: "Blockchain Integration",
      status: "pending",
      description: "Asset tokenization and smart contract deployment",
      estimatedTime: "1 business day"
    },
    {
      id: "5",
      name: "Trading Activation",
      status: "pending",
      description: "RECs available for trading on RECtify platform",
      estimatedTime: "Immediate"
    }
  ]);

  const [requiredDocuments] = useState<DocumentFile[]>([
    {
      id: "1",
      name: "Facility Registration Certificate",
      type: "pdf",
      size: "2.3 MB",
      status: "verified",
      required: true
    },
    {
      id: "2",
      name: "Environmental Impact Assessment",
      type: "pdf",
      size: "5.8 MB",
      status: "uploaded",
      required: true
    },
    {
      id: "3",
      name: "Grid Connection Agreement",
      type: "pdf",
      size: "1.2 MB",
      status: "verified",
      required: true
    },
    {
      id: "4",
      name: "Technology Specifications",
      type: "pdf",
      size: "3.1 MB",
      status: "pending",
      required: true
    },
    {
      id: "5",
      name: "Commissioning Certificate",
      type: "pdf",
      size: "1.8 MB",
      status: "verified",
      required: true
    },
    {
      id: "6",
      name: "Land Ownership/Lease Agreement",
      type: "pdf",
      size: "2.7 MB",
      status: "uploaded",
      required: false
    }
  ]);

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
    const completed = verificationSteps.filter(step => step.status === 'completed').length;
    return (completed / verificationSteps.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-rectify-green" />
          <div>
            <h1 className="text-2xl font-bold">REC Registration & Verification</h1>
            <p className="text-muted-foreground">
              Register your renewable energy facility and get RECs verified through accredited third parties
            </p>
          </div>
        </div>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Verified className="h-5 w-5 text-rectify-blue" />
            <span>Verification Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          <div className="grid gap-3">
            {verificationSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className={`p-1 rounded-full ${getStatusColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{step.name}</span>
                    <Badge variant="outline" className={getStatusColor(step.status)}>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  <p className="text-xs text-muted-foreground">Est. time: {step.estimatedTime}</p>
                  {step.completedAt && (
                    <p className="text-xs text-green-600">Completed: {step.completedAt}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Registration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="facility" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Facility Info</span>
            <span className="sm:hidden">Facility</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Technical</span>
            <span className="sm:hidden">Tech</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Verification</span>
            <span className="sm:inline">Verify</span>
          </TabsTrigger>
        </TabsList>

        {/* Facility Information Tab */}
        <TabsContent value="facility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Facility Registration</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Register your renewable energy facility with complete location and ownership details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="coordinates">GPS Coordinates *</Label>
                  <Input 
                    id="coordinates"
                    placeholder="e.g., 24.5588° N, 55.6813° E"
                    value={registrationData.coordinates}
                    onChange={(e) => setRegistrationData({...registrationData, coordinates: e.target.value})}
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
        </TabsContent>

        {/* Technical Information Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Technical Specifications</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide technical details and commissioning information
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission-date">Commissioning Date *</Label>
                  <Input 
                    id="commission-date"
                    type="date"
                    value={registrationData.commissionDate}
                    onChange={(e) => setRegistrationData({...registrationData, commissionDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration-date">Certificate Expiration Date *</Label>
                  <Input 
                    id="expiration-date"
                    type="date"
                    value={registrationData.expirationDate}
                    onChange={(e) => setRegistrationData({...registrationData, expirationDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certification-standard">Certification Standard *</Label>
                  <Select value={registrationData.certificationStandard} onValueChange={(value) => 
                    setRegistrationData({...registrationData, certificationStandard: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="irec">I-REC Standard</SelectItem>
                      <SelectItem value="go">GO (Guarantee of Origin)</SelectItem>
                      <SelectItem value="rec">US REC Standard</SelectItem>
                      <SelectItem value="tigr">TIGR (The International Green Certificate Registry)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-body">Verification Body *</Label>
                  <Select value={registrationData.verificationBody} onValueChange={(value) => 
                    setRegistrationData({...registrationData, verificationBody: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification body" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sgs">SGS - Societe Generale de Surveillance</SelectItem>
                      <SelectItem value="tuv">TÜV SD</SelectItem>
                      <SelectItem value="dnv">DNV (Det Norske Veritas)</SelectItem>
                      <SelectItem value="bureau-veritas">Bureau Veritas</SelectItem>
                      <SelectItem value="intertek">Intertek</SelectItem>
                      <SelectItem value="control-union">Control Union</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All technical specifications will be verified by your selected verification body. 
                  This process typically takes 5-10 business days and includes on-site inspections.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Required Documentation</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload all required documents for facility verification
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          <span>{doc.size}</span>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(doc.status)}`}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.status === 'verified' && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      {doc.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                      {(doc.status === 'uploaded' || doc.status === 'verified') && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Additional Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PDF, DOCX, XLSX. Max size: 10MB per file.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Third-Party Verification</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time verification status from accredited verification bodies
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* I-REC Registry Integration */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">I-REC Registry</h4>
                      <p className="text-sm text-muted-foreground">International REC Standard Registry</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                </div>
                <p className="text-sm">
                  Facility registration submitted to I-REC Registry for validation. 
                  Registry ID: <code className="bg-gray-100 px-1 rounded">UAE-SOL-2024-001234</code>
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View in Registry
                  </Button>
                </div>
              </div>

              {/* Verification Body Status */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-full">
                      <Verified className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">SGS Verification</h4>
                      <p className="text-sm text-muted-foreground">Independent Third-Party Auditor</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Awaiting Documents
                  </Badge>
                </div>
                <p className="text-sm">
                  SGS will conduct facility verification once all documents are uploaded. 
                  Verification includes on-site inspection and technical review.
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    SGS Portal
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Verification Report
                  </Button>
                </div>
              </div>

              {/* Blockchain Integration */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-between justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 rounded-full">
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Blockchain Integration</h4>
                      <p className="text-sm text-muted-foreground">Smart Contract & Tokenization</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <p className="text-sm">
                  Asset will be tokenized on blockchain after successful verification. 
                  Each REC will have a unique digital certificate with immutable provenance.
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All verification processes are conducted by accredited independent bodies. 
                  RECtify does not charge additional fees for third-party verification services.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-3">
                <Button className="flex-1 bg-rectify-green hover:bg-rectify-green-dark">
                  <Shield className="h-4 w-4 mr-2" />
                  Submit for Verification
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


