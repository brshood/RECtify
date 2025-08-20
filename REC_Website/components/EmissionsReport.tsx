import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { EmissionsReportWizard } from "./EmissionsReportWizard";
import { EmissionsReportView } from "./EmissionsReportView";
import { 
  FileText, 
  Building2, 
  Target, 
  Database, 
  Calculator, 
  TrendingDown, 
  Shield, 
  CheckCircle, 
  Paperclip, 
  Eye,
  Save,
  Download,
  Upload,
  AlertCircle,
  Leaf
} from "lucide-react";

export interface EmissionsReportData {
  company: {
    name: string;
    tradeLicense: string;
    address: string;
    contactPerson: string;
    email: string;
    phone: string;
    sector: string;
    employees: number;
    reportingYear: number;
  };
  reportingScope: {
    organizationalBoundary: string;
    operationalBoundary: string[];
    facilities: Array<{
      id: string;
      name: string;
      address: string;
      type: string;
      ownership: number;
    }>;
  };
  activityData: {
    scope1: Array<{
      id: string;
      source: string;
      activity: string;
      amount: number;
      unit: string;
      facility: string;
    }>;
    scope2: Array<{
      id: string;
      source: string;
      amount: number;
      unit: string;
      facility: string;
    }>;
    scope3: Array<{
      id: string;
      category: string;
      activity: string;
      amount: number;
      unit: string;
    }>;
  };
  emissionFactors: {
    scope1Factors: Array<{
      source: string;
      factor: number;
      unit: string;
      reference: string;
    }>;
    scope2Factors: Array<{
      source: string;
      factor: number;
      unit: string;
      reference: string;
    }>;
    scope3Factors: Array<{
      category: string;
      factor: number;
      unit: string;
      reference: string;
    }>;
  };
  calculations: {
    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    totalEmissions: number;
    emissionsByFacility: Array<{
      facility: string;
      scope1: number;
      scope2: number;
      total: number;
    }>;
    emissionsByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  reductionsCredits: {
    reductionMeasures: Array<{
      id: string;
      measure: string;
      description: string;
      reductionAmount: number;
      implementation: string;
    }>;
    nrccCredits: Array<{
      id: string;
      projectName: string;
      vintage: number;
      amount: number;
      registry: string;
      serialNumber: string;
    }>;
    netEmissions: number;
  };
  verification: {
    verificationRequired: boolean;
    verifierName?: string;
    verifierAccreditation?: string;
    verificationStatement?: string;
    verificationDate?: string;
  };
  declarations: {
    accuracyDeclaration: boolean;
    completenessDeclaration: boolean;
    complianceDeclaration: boolean;
    authorizedSignatory: string;
    position: string;
    date: string;
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    required: boolean;
    uploaded: boolean;
    fileName?: string;
    fileSize?: number;
    uploadDate?: string;
  }>;
}

const steps = [
  { id: 1, title: "Company Information", icon: Building2, description: "Basic company details and reporting year" },
  { id: 2, title: "Reporting Scope", icon: Target, description: "Define organizational and operational boundaries" },
  { id: 3, title: "Activity Data", icon: Database, description: "Collect emission source data across all scopes" },
  { id: 4, title: "Emission Factors", icon: Calculator, description: "Apply appropriate emission factors" },
  { id: 5, title: "Calculations", icon: TrendingDown, description: "Calculate total emissions by scope and facility" },
  { id: 6, title: "Reductions & Credits", icon: Leaf, description: "Document reduction measures and NRCC credits" },
  { id: 7, title: "Verification", icon: Shield, description: "Third-party verification requirements" },
  { id: 8, title: "Declarations", icon: CheckCircle, description: "Management declarations and attestations" },
  { id: 9, title: "Attachments", icon: Paperclip, description: "Supporting documents and evidence" },
  { id: 10, title: "Review & Generate", icon: Eye, description: "Final review and report generation" }
];

export function EmissionsReport() {
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'report'>('wizard');
  const [reportData, setReportData] = useState<EmissionsReportData>(() => {
    const defaultData: EmissionsReportData = {
      company: {
        name: '',
        tradeLicense: '',
        address: '',
        contactPerson: '',
        email: '',
        phone: '',
        sector: '',
        employees: 0,
        reportingYear: new Date().getFullYear() - 1
      },
      reportingScope: {
        organizationalBoundary: '',
        operationalBoundary: [],
        facilities: []
      },
      activityData: {
        scope1: [],
        scope2: [],
        scope3: []
      },
      emissionFactors: {
        scope1Factors: [],
        scope2Factors: [],
        scope3Factors: []
      },
      calculations: {
        scope1Total: 0,
        scope2Total: 0,
        scope3Total: 0,
        totalEmissions: 0,
        emissionsByFacility: [],
        emissionsByCategory: []
      },
      reductionsCredits: {
        reductionMeasures: [],
        nrccCredits: [],
        netEmissions: 0
      },
      verification: {
        verificationRequired: false
      },
      declarations: {
        accuracyDeclaration: false,
        completenessDeclaration: false,
        complianceDeclaration: false,
        authorizedSignatory: '',
        position: '',
        date: ''
      },
      attachments: [
        { id: '1', name: 'Activity Data Spreadsheet', type: 'Excel', description: 'Detailed activity data with source documentation', required: true, uploaded: false },
        { id: '2', name: 'Emission Factor References', type: 'PDF', description: 'Documentation of emission factors used', required: true, uploaded: false },
        { id: '3', name: 'NRCC Credit Certificates', type: 'PDF', description: 'Valid NRCC credit certificates', required: false, uploaded: false },
        { id: '4', name: 'Verification Statement', type: 'PDF', description: 'Third-party verification statement', required: false, uploaded: false }
      ]
    };

    const saved = localStorage.getItem('reportData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Merge saved data with defaults to ensure all properties exist
        return {
          company: { ...defaultData.company, ...parsedData.company },
          reportingScope: { 
            ...defaultData.reportingScope, 
            ...parsedData.reportingScope,
            facilities: parsedData.reportingScope?.facilities || [],
            operationalBoundary: parsedData.reportingScope?.operationalBoundary || []
          },
          activityData: { 
            ...defaultData.activityData, 
            ...parsedData.activityData,
            scope1: parsedData.activityData?.scope1 || [],
            scope2: parsedData.activityData?.scope2 || [],
            scope3: parsedData.activityData?.scope3 || []
          },
          emissionFactors: { 
            ...defaultData.emissionFactors, 
            ...parsedData.emissionFactors,
            scope1Factors: parsedData.emissionFactors?.scope1Factors || [],
            scope2Factors: parsedData.emissionFactors?.scope2Factors || [],
            scope3Factors: parsedData.emissionFactors?.scope3Factors || []
          },
          calculations: { 
            ...defaultData.calculations, 
            ...parsedData.calculations,
            emissionsByFacility: parsedData.calculations?.emissionsByFacility || [],
            emissionsByCategory: parsedData.calculations?.emissionsByCategory || []
          },
          reductionsCredits: { 
            ...defaultData.reductionsCredits, 
            ...parsedData.reductionsCredits,
            reductionMeasures: parsedData.reductionsCredits?.reductionMeasures || [],
            nrccCredits: parsedData.reductionsCredits?.nrccCredits || []
          },
          verification: { ...defaultData.verification, ...parsedData.verification },
          declarations: { ...defaultData.declarations, ...parsedData.declarations },
          attachments: parsedData.attachments || defaultData.attachments
        };
      } catch (error) {
        console.error('Error parsing saved report data:', error);
        return defaultData;
      }
    }
    return defaultData;
  });

  // Auto-save to localStorage with error handling
  useEffect(() => {
    try {
      if (reportData) {
        localStorage.setItem('reportData', JSON.stringify(reportData));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [reportData]);

  const updateReportData = (section: keyof EmissionsReportData, data: any) => {
    setReportData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const isStepComplete = (stepId: number): boolean => {
    // Add null checks to prevent undefined access
    if (!reportData) return false;
    
    switch (stepId) {
      case 1:
        return !!(reportData.company?.name && reportData.company?.tradeLicense && reportData.company?.contactPerson);
      case 2:
        return !!(reportData.reportingScope?.organizationalBoundary && reportData.reportingScope?.facilities?.length > 0);
      case 3:
        return (reportData.activityData?.scope1?.length > 0) || (reportData.activityData?.scope2?.length > 0);
      case 4:
        return (reportData.emissionFactors?.scope1Factors?.length > 0) || (reportData.emissionFactors?.scope2Factors?.length > 0);
      case 5:
        return (reportData.calculations?.totalEmissions || 0) > 0;
      case 6:
        return true; // Optional step
      case 7:
        return !reportData.verification?.verificationRequired || !!reportData.verification?.verifierName;
      case 8:
        return !!(reportData.declarations?.accuracyDeclaration && reportData.declarations?.completenessDeclaration && reportData.declarations?.complianceDeclaration);
      case 9:
        return reportData.attachments?.filter(a => a.required)?.every(a => a.uploaded) ?? false;
      case 10:
        return true;
      default:
        return false;
    }
  };

  const completedSteps = steps?.filter(step => isStepComplete(step.id))?.length || 0;
  const progressPercentage = (completedSteps / (steps?.length || 1)) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    try {
      if (reportData) {
        localStorage.setItem('reportData', JSON.stringify(reportData));
        // Show success toast or notification
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emissions-report-${reportData.company.name}-${reportData.company.reportingYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setReportData(data);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateReport = () => {
    setViewMode('report');
  };

  // Ensure reportData is properly initialized before rendering
  if (!reportData || !reportData.company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rectify-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading emissions report...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'report') {
    return (
      <EmissionsReportView 
        reportData={reportData} 
        onBackToWizard={() => setViewMode('wizard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Emissions Report</h1>
            <p className="text-muted-foreground">
              UAE Federal Decree-Law No. (11) of 2024 Compliance Tool
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleDownloadJSON}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <label htmlFor="upload-json">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Button>
              <input
                id="upload-json"
                type="file"
                accept=".json"
                onChange={handleUploadJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Report Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps} of {steps.length} steps completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex flex-wrap gap-2">
                {steps.map((step) => (
                  <Badge
                    key={step.id}
                    variant={isStepComplete(step.id) ? "default" : "secondary"}
                    className={isStepComplete(step.id) ? "bg-rectify-green" : ""}
                  >
                    {step.title}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Stepper */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Report Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isComplete = isStepComplete(step.id);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-rectify-green text-white' 
                        : isComplete
                        ? 'bg-rectify-accent hover:bg-rectify-green/20'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${isActive ? 'text-white' : isComplete ? 'text-rectify-green' : 'text-muted-foreground'}`}>
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {step.id}. {step.title}
                          </span>
                          {!isComplete && step.id <= 8 && (
                            <AlertCircle className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isActive ? 'text-white/80' : 'text-muted-foreground'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-3">
          <EmissionsReportWizard
            currentStep={currentStep}
            reportData={reportData}
            updateReportData={updateReportData}
            onNext={handleNext}
            onBack={handleBack}
            onGenerateReport={handleGenerateReport}
            isStepComplete={isStepComplete}
          />
        </div>
      </div>
    </div>
  );
}