import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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
  Leaf,
  X,
  Info,
  Zap,
  Globe,
  Flag
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
    calculatedAt?: string;
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
    verificationType?: 'none' | 'third-party';
    verifierName?: string;
    verifierEmail?: string;
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
  marketingBoxClosed?: boolean;
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
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [reportData, setReportData] = useState<EmissionsReportData>(() => {
    // Clear any existing localStorage data to start fresh
    const shouldStartFresh = !localStorage.getItem('reportData') || localStorage.getItem('startFresh') === 'true';
    
    if (shouldStartFresh) {
      localStorage.removeItem('reportData');
      localStorage.removeItem('startFresh');
    }
    
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
        verificationRequired: false,
        verificationType: undefined
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
            calculatedAt: parsedData.calculations?.calculatedAt || undefined,
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
        // Company Information - require all essential fields
        return !!(reportData.company?.name && 
                 reportData.company?.tradeLicense && 
                 reportData.company?.address &&
                 reportData.company?.contactPerson && 
                 reportData.company?.email && 
                 reportData.company?.reportingYear);
      case 2:
        // Reporting Scope - require organizational boundary and at least one facility
        return !!(reportData.reportingScope?.organizationalBoundary && 
                 reportData.reportingScope?.operationalBoundary?.length > 0 &&
                 reportData.reportingScope?.facilities?.length > 0);
      case 3:
        // Activity Data - require at least one activity in scope 1 or 2
        return (reportData.activityData?.scope1?.length > 0) || (reportData.activityData?.scope2?.length > 0);
      case 4:
        // Emission Factors - require at least one emission factor for scope 1 or 2
        return (reportData.emissionFactors?.scope1Factors?.length > 0) || (reportData.emissionFactors?.scope2Factors?.length > 0);
      case 5:
        // Calculations - require calculations to be performed
        return !!reportData.calculations?.calculatedAt;
      case 6:
        // Reductions & Credits - optional step, only true if data is entered
        return (reportData.reductionsCredits?.reductionMeasures?.length > 0) || (reportData.reductionsCredits?.nrccCredits?.length > 0);
      case 7:
        // Verification - require verification type to be selected
        if (!reportData.verification?.verificationType) return false;
        if (reportData.verification?.verificationType === 'third-party') {
          return !!(reportData.verification?.verifierName && reportData.verification?.verifierEmail && reportData.verification?.verifierAccreditation);
        }
        return true;
      case 8:
        // Declarations - require all three declarations and signatory info
        return !!(reportData.declarations?.accuracyDeclaration && 
                 reportData.declarations?.completenessDeclaration && 
                 reportData.declarations?.complianceDeclaration &&
                 reportData.declarations?.authorizedSignatory &&
                 reportData.declarations?.position &&
                 reportData.declarations?.date);
      case 9:
        // Attachments - require all required attachments to be uploaded
        const requiredAttachments = reportData.attachments?.filter(a => a.required) || [];
        return requiredAttachments.length > 0 && requiredAttachments.every(a => a.uploaded);
      case 10:
        // Review - only complete if report is ready for generation (80% completion and calculations done)
        return calculateReportCompletion() >= 80 && !!reportData.calculations?.calculatedAt;
      default:
        return false;
    }
  };

  // Unified completion calculation function
  const calculateReportCompletion = () => {
    let completionScore = 0;
    const totalPossibleScore = 100;
    
    // Company Information (15 points)
    if (reportData.company?.name && reportData.company?.tradeLicense && reportData.company?.address && 
        reportData.company?.contactPerson && reportData.company?.email && reportData.company?.reportingYear) {
      completionScore += 15;
    }
    
    // Reporting Scope (10 points)
    if (reportData.reportingScope?.organizationalBoundary && 
        reportData.reportingScope?.operationalBoundary?.length > 0 &&
        reportData.reportingScope?.facilities?.length > 0) {
      completionScore += 10;
    }
    
    // Activity Data (25 points)
    const hasScope1Data = reportData.activityData?.scope1?.length > 0;
    const hasScope2Data = reportData.activityData?.scope2?.length > 0;
    const hasScope3Data = reportData.activityData?.scope3?.length > 0;
    
    if (hasScope1Data) completionScore += 10;
    if (hasScope2Data) completionScore += 10;
    if (hasScope3Data) completionScore += 5;
    
    // Emission Factors (15 points)
    const hasScope1Factors = reportData.emissionFactors?.scope1Factors?.length > 0;
    const hasScope2Factors = reportData.emissionFactors?.scope2Factors?.length > 0;
    const hasScope3Factors = reportData.emissionFactors?.scope3Factors?.length > 0;
    
    if (hasScope1Factors) completionScore += 5;
    if (hasScope2Factors) completionScore += 5;
    if (hasScope3Factors) completionScore += 5;
    
    // Calculations (15 points)
    if (reportData.calculations?.calculatedAt) {
      completionScore += 15;
    }
    
    // Reductions & Credits (5 points)
    if (reportData.reductionsCredits?.reductionMeasures?.length > 0) {
      completionScore += 5;
    }
    
    // Verification (5 points)
    if (reportData.verification?.verificationRequired !== undefined) {
      completionScore += 5;
    }
    
    // Declarations (5 points)
    if (reportData.declarations?.accuracyDeclaration && 
        reportData.declarations?.completenessDeclaration && 
        reportData.declarations?.complianceDeclaration &&
        reportData.declarations?.authorizedSignatory &&
        reportData.declarations?.position &&
        reportData.declarations?.date) {
      completionScore += 5;
    }
    
    // Attachments (5 points)
    const requiredAttachments = (reportData.attachments || []).filter(a => a.required);
    const uploadedRequiredAttachments = requiredAttachments.filter(a => a.uploaded);
    if (uploadedRequiredAttachments.length === requiredAttachments.length && requiredAttachments.length > 0) {
      completionScore += 5;
    }
    
    return Math.min(completionScore, totalPossibleScore);
  };

  const completedSteps = steps?.filter(step => isStepComplete(step.id))?.length || 0;
  const progressPercentage = calculateReportCompletion();

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
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.setItem('startFresh', 'true');
                window.location.reload();
              }}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Start Fresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowHowItWorks(true)}
              className="text-rectify-green border-rectify-green hover:bg-rectify-green/10"
            >
              <Info className="h-4 w-4 mr-2" />
              How It Works?
            </Button>
          </div>
        </div>

        {/* Marketing Box */}
        <Card className="border-rectify-green/20 bg-gradient-to-r from-rectify-green/5 to-rectify-blue/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rectify-green/10 rounded-lg">
                  <FileText className="h-6 w-6 text-rectify-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-rectify-green">UAE Emissions Inventory Report Tool</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps === 0 
                      ? "TurboTax-style wizard that guides you through UAE Federal Decree-Law No. (11) of 2024 compliance"
                      : `Continue your report - ${completedSteps} of ${steps.length} steps completed`
                    }
                  </p>
                </div>
              </div>
              
              {completedSteps < 5 && !reportData.marketingBoxClosed ? (
                <div className="space-y-6">
                  {/* Marketing Message */}
                  <div className="bg-gradient-to-r from-rectify-green/10 to-rectify-blue/10 p-6 rounded-lg border border-rectify-green/20 relative">
                    <button
                      onClick={() => updateReportData('marketingBoxClosed', true)}
                      className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      aria-label="Close marketing message"
                    >
                      <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
                    </button>
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-rectify-green mb-2">📋 What is an Emissions Report?</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        An emissions report is like a "carbon footprint statement" for your company. It measures how much greenhouse gas your business activities produce - from electricity use to company vehicles to business travel. The UAE government requires this report to track progress toward Net Zero 2050 goals.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-white/50 rounded-lg">
                        <div className="text-2xl mb-2">🏢</div>
                        <h5 className="font-medium text-sm mb-1">For Companies</h5>
                        <p className="text-xs text-muted-foreground">Meet UAE compliance requirements and demonstrate environmental responsibility</p>
                      </div>
                      <div className="p-3 bg-white/50 rounded-lg">
                        <div className="text-2xl mb-2">📊</div>
                        <h5 className="font-medium text-sm mb-1">Simple Process</h5>
                        <p className="text-xs text-muted-foreground">Just enter your data - we handle the complex calculations and formatting</p>
                      </div>
                      <div className="p-3 bg-white/50 rounded-lg">
                        <div className="text-2xl mb-2">✅</div>
                        <h5 className="font-medium text-sm mb-1">Official Submission</h5>
                        <p className="text-xs text-muted-foreground">Generate a professional PDF report ready for government submission</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">🎯 What This Tool Does:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span><strong>Automates compliance</strong> with UAE Federal Decree-Law No. (11) of 2024</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span><strong>Calculates emissions</strong> using official UAE emission factors</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span><strong>Generates professional PDF</strong> ready for regulatory submission</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-rectify-green mt-0.5 flex-shrink-0" />
                          <span><strong>Bulk data import</strong> via CSV templates for large datasets</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">⚡ How It Works:</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start space-x-2">
                          <div className="bg-rectify-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                          <span><strong>Enter company info</strong> - Basic details and reporting year</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="bg-rectify-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                          <span><strong>Define your scope</strong> - Facilities and emission boundaries</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="bg-rectify-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                          <span><strong>Upload activity data</strong> - Energy use, fuel consumption, travel</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="bg-rectify-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</div>
                          <span><strong>Auto-calculate emissions</strong> - System does the complex math</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="bg-rectify-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">5</div>
                          <span><strong>Generate report</strong> - Professional PDF ready for submission</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    You're making great progress! Continue through the remaining steps to complete your compliance report.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Save className="h-3 w-3 text-rectify-green" />
                      <span>Auto-saved</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="h-3 w-3 text-rectify-green" />
                      <span>CSV templates available</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileText className="h-3 w-3 text-rectify-green" />
                      <span>PDF generation ready</span>
                    </span>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-rectify-green/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  {completedSteps < 5 ? (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Save className="h-4 w-4 text-rectify-green" />
                      <span>Your progress auto-saves as you go</span>
                      <Separator orientation="vertical" className="h-4" />
                      <Download className="h-4 w-4 text-rectify-green" />
                      <span>Download templates for bulk import</span>
                    </div>
                                     ) : (
                     <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                       <span>{progressPercentage.toFixed(0)}% Complete</span>
                       <Separator orientation="vertical" className="h-4" />
                       <span>Estimated {Math.max(1, Math.ceil((100 - progressPercentage) / 10))} minutes remaining</span>
                     </div>
                   )}
                  <Badge variant="secondary" className="bg-rectify-green/10 text-rectify-green border-rectify-green/20">
                    {completedSteps === 0 ? "⏱️ Takes 15-30 minutes" : `📋 Step ${currentStep} of 10`}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    onClick={() => {
                      try {
                        setCurrentStep(step.id);
                      } catch (error) {
                        console.error(`Error navigating to step ${step.id}:`, error);
                        // Fallback to step 1 if there's an error
                        setCurrentStep(1);
                      }
                    }}
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
          {(() => {
            try {
              return (
                <EmissionsReportWizard
                  currentStep={currentStep}
                  reportData={reportData}
                  updateReportData={updateReportData}
                  onNext={handleNext}
                  onBack={handleBack}
                  onGenerateReport={handleGenerateReport}
                  isStepComplete={isStepComplete}
                />
              );
            } catch (error) {
              console.error('Error rendering EmissionsReportWizard:', error);
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span>Error Loading Step {currentStep}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>There was an error loading this step.</p>
                      <p className="text-sm mt-2">Please try refreshing the page or go back to a previous step.</p>
                      <Button 
                        onClick={() => setCurrentStep(1)} 
                        className="mt-4"
                        variant="outline"
                      >
                        Go to Step 1
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })()}
        </div>
      </div>

      {/* How It Works Popup */}
      <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <Calculator className="h-6 w-6 text-rectify-green" />
              <span>How Emissions Calculations Work</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-gradient-to-r from-rectify-green/5 to-rectify-blue/5 p-4 rounded-lg border border-rectify-green/20">
              <h3 className="text-lg font-semibold text-rectify-green mb-2">📊 Calculation Overview</h3>
              <p className="text-sm text-muted-foreground">
                Emissions are calculated using the formula: <strong>Emissions = Activity Data × Emission Factor</strong>
              </p>
            </div>

            {/* Scope 1 Calculations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-500" />
                <span>Scope 1: Direct Emissions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-red-700">Fuel Combustion</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>CO₂ = Fuel Amount × Emission Factor</div>
                    <div className="text-muted-foreground mt-1">
                      Example: 1000 L diesel × 2.68 kg CO₂/L = 2,680 kg CO₂
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-red-700">Company Vehicles</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>CO₂ = Distance × Emission Factor</div>
                    <div className="text-muted-foreground mt-1">
                      Example: 5000 km × 0.15 kg CO₂/km = 750 kg CO₂
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scope 2 Calculations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span>Scope 2: Energy Indirect Emissions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-700">Electricity Consumption</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>CO₂ = Electricity (kWh) × Grid Factor</div>
                    <div className="text-muted-foreground mt-1">
                      Example: 10,000 kWh × 0.5 kg CO₂/kWh = 5,000 kg CO₂
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-700">Heat/Steam</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>CO₂ = Heat Amount × Heat Factor</div>
                    <div className="text-muted-foreground mt-1">
                      Example: 500 GJ × 50 kg CO₂/GJ = 25,000 kg CO₂
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scope 3 Calculations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-500" />
                <span>Scope 3: Other Indirect Emissions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700">Business Travel</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>CO₂ = Distance × Mode Factor</div>
                    <div className="text-muted-foreground mt-1">
                      Example: 2000 km flight × 0.25 kg CO₂/km = 500 kg CO₂
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700">Waste Disposal</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    <div>CO₂ = Waste Amount × Waste Factor</div>
                    <div className="text-muted-foreground mt-1">
                      Example: 10 tonnes × 0.5 kg CO₂/tonne = 5 kg CO₂
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UAE Emission Factors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Flag className="h-5 w-5 text-yellow-500" />
                <span>UAE Emission Factors</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Source</th>
                      <th className="border border-gray-200 p-2 text-left">Emission Factor</th>
                      <th className="border border-gray-200 p-2 text-left">Unit</th>
                      <th className="border border-gray-200 p-2 text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-2">Diesel</td>
                      <td className="border border-gray-200 p-2 font-mono">2.68</td>
                      <td className="border border-gray-200 p-2">kg CO₂/L</td>
                      <td className="border border-gray-200 p-2">IPCC Guidelines</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-2">Gasoline</td>
                      <td className="border border-gray-200 p-2 font-mono">2.31</td>
                      <td className="border border-gray-200 p-2">kg CO₂/L</td>
                      <td className="border border-gray-200 p-2">IPCC Guidelines</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-2">UAE Grid Electricity</td>
                      <td className="border border-gray-200 p-2 font-mono">0.5</td>
                      <td className="border border-gray-200 p-2">kg CO₂/kWh</td>
                      <td className="border border-gray-200 p-2">UAE Energy Authority</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-2">Natural Gas</td>
                      <td className="border border-gray-200 p-2 font-mono">2.16</td>
                      <td className="border border-gray-200 p-2">kg CO₂/m³</td>
                      <td className="border border-gray-200 p-2">IPCC Guidelines</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-2">Air Travel (Economy)</td>
                      <td className="border border-gray-200 p-2 font-mono">0.25</td>
                      <td className="border border-gray-200 p-2">kg CO₂/km</td>
                      <td className="border border-gray-200 p-2">ICAO Calculator</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-purple-500" />
                <span>Total Emissions Calculation</span>
              </h3>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="space-y-2 text-sm font-mono">
                  <div><strong>Total CO₂e = Scope 1 + Scope 2 + Scope 3</strong></div>
                  <div className="text-muted-foreground">
                    Example: 3,430 + 30,000 + 505 = 33,935 kg CO₂e
                  </div>
                  <div className="mt-3">
                    <strong>Convert to tonnes:</strong> 33,935 kg ÷ 1,000 = 33.94 tCO₂e
                  </div>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <span>Calculation Process</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">1</div>
                  <div>
                    <div className="font-medium">Data Collection</div>
                    <div className="text-sm text-muted-foreground">Gather activity data (fuel consumption, electricity use, travel distances)</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">2</div>
                  <div>
                    <div className="font-medium">Factor Application</div>
                    <div className="text-sm text-muted-foreground">Multiply activity data by appropriate UAE emission factors</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">3</div>
                  <div>
                    <div className="font-medium">Scope Aggregation</div>
                    <div className="text-sm text-muted-foreground">Sum emissions by scope (1, 2, 3) and calculate totals</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">4</div>
                  <div>
                    <div className="font-medium">Report Generation</div>
                    <div className="text-sm text-muted-foreground">Generate professional PDF report with all calculations and breakdowns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}