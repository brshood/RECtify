import { useState, useRef } from "react";
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
  Eye,
  X,
  Plus
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
  size: number;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
  file?: File;
  uploadDate?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    },
    {
      id: "5",
      name: "Commissioning Certificate",
      type: "pdf",
      size: 0,
      status: "pending",
      required: true
    },
    {
      id: "6",
      name: "Land Ownership/Lease Agreement",
      type: "pdf",
      size: 0,
      status: "pending",
      required: false
    }
  ]);

  // Calculate verification steps based on actual progress
  const getVerificationSteps = (): VerificationStep[] => {
    const uploadedDocs = requiredDocuments.filter(doc => doc.status === 'uploaded' || doc.status === 'verified').length;
    const totalRequiredDocs = requiredDocuments.filter(doc => doc.required).length;
    const isFormComplete = registrationData.facilityName && registrationData.technology && 
                          registrationData.capacity && registrationData.location && 
                          registrationData.emirate && registrationData.owner;

    return [
      {
        id: "1",
        name: "Document Upload",
        status: uploadedDocs >= totalRequiredDocs ? "completed" : uploadedDocs > 0 ? "in-progress" : "pending",
        description: "Upload all required facility and certification documents",
        estimatedTime: "5 minutes",
        completedAt: uploadedDocs >= totalRequiredDocs ? new Date().toISOString() : undefined
      },
      {
        id: "2", 
        name: "Form Completion",
        status: isFormComplete ? "completed" : "pending",
        description: "Complete all required facility information",
        estimatedTime: "10 minutes",
        completedAt: isFormComplete ? new Date().toISOString() : undefined
      },
      {
        id: "3",
        name: "I-REC Registry Validation",
        status: isFormComplete && uploadedDocs >= totalRequiredDocs ? "pending" : "pending",
        description: "I-REC Registry validates facility registration and compliance",
        estimatedTime: "2-3 business days"
      },
      {
        id: "4",
        name: "Third-Party Verification",
        status: "pending",
        description: "Independent verification body conducts facility audit",
        estimatedTime: "5-10 business days"
      },
      {
        id: "5",
        name: "Trading Activation",
        status: "pending",
        description: "RECs available for trading on RECtify platform",
        estimatedTime: "Immediate"
      }
    ];
  };

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
    const verificationSteps = getVerificationSteps();
    const completed = verificationSteps.filter(step => step.status === 'completed').length;
    return (completed / verificationSteps.length) * 100;
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

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF and DOC files are allowed');
      event.target.value = '';
      return;
    }

    // Update document status
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

  const handleSubmitForVerification = () => {
    const verificationSteps = getVerificationSteps();
    const isFormComplete = verificationSteps[1].status === 'completed';
    const isDocsComplete = verificationSteps[0].status === 'completed';

    if (!isFormComplete) {
      alert('Please complete all required facility information first.');
      setActiveTab('facility');
      return;
    }

    if (!isDocsComplete) {
      alert('Please upload all required documents first.');
      setActiveTab('documents');
      return;
    }

    alert('Registration submitted for verification! You will receive updates via email.');
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
            {getVerificationSteps().map((step) => (
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
                    <p className="text-xs text-green-600">Completed: {new Date(step.completedAt).toLocaleString()}</p>
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
            {registrationData.facilityName && registrationData.technology && registrationData.capacity && registrationData.location && registrationData.emirate && registrationData.owner && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Technical</span>
            <span className="sm:hidden">Tech</span>
            {registrationData.commissionDate && registrationData.expirationDate && registrationData.certificationStandard && registrationData.verificationBody && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
            {requiredDocuments.filter(doc => doc.required).every(doc => doc.status === 'uploaded' || doc.status === 'verified') && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
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
                  <Badge className="bg-gray-100 text-gray-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <p className="text-sm">
                  Facility registration will be submitted to I-REC Registry after form completion and document upload.
                </p>
              </div>

              {/* Verification Body Status */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-full">
                      <Verified className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Third-Party Verification</h4>
                      <p className="text-sm text-muted-foreground">Independent Verification Body</p>
                    </div>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <p className="text-sm">
                  Verification will be conducted by your selected verification body after I-REC registry validation.
                </p>
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
                <Button 
                  className="flex-1 bg-rectify-green hover:bg-rectify-green-dark"
                  onClick={handleSubmitForVerification}
                >
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


