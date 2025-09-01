import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { EmissionsReportData } from "./EmissionsReport";
import { UAEEmissionsCalculator } from "./UAEEmissionsCalculator";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Info, 
  Calculator,
  FileText,
  CheckCircle,
  AlertTriangle,
  Leaf,
  Zap,
  FileSpreadsheet,
  Target,
  TrendingDown,
  Shield,
  Paperclip,
  X,
  Eye,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface EmissionsReportWizardProps {
  currentStep: number;
  reportData: EmissionsReportData;
  updateReportData: (section: keyof EmissionsReportData, data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerateReport: () => void;
  isStepComplete: (stepId: number) => boolean;
}

export function EmissionsReportWizard({
  currentStep,
  reportData,
  updateReportData,
  onNext,
  onBack,
  onGenerateReport,
  isStepComplete
}: EmissionsReportWizardProps) {

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInformationStep reportData={reportData} updateReportData={updateReportData} />;
      case 2:
        return <ReportingScopeStep reportData={reportData} updateReportData={updateReportData} />;
      case 3:
        return <ActivityDataStep reportData={reportData} updateReportData={updateReportData} />;
      case 4:
        return <EmissionFactorsStep reportData={reportData} updateReportData={updateReportData} />;
      case 5:
        return <CalculationsStep reportData={reportData} updateReportData={updateReportData} />;
      case 6:
        return <ReductionsCreditsStep reportData={reportData} updateReportData={updateReportData} />;
      case 7:
        return <VerificationStep reportData={reportData} updateReportData={updateReportData} />;
      case 8:
        return <DeclarationsStep reportData={reportData} updateReportData={updateReportData} />;
      case 9:
        return <AttachmentsStep reportData={reportData} updateReportData={updateReportData} />;
      case 10:
        return <ReviewStep reportData={reportData} onGenerateReport={onGenerateReport} isStepComplete={isStepComplete} />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {renderStepContent()}
        
        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              
              <div className="flex space-x-2">
                {currentStep < 10 && (
                  <Button
                    onClick={onNext}
                    className="bg-rectify-green hover:bg-rectify-green-dark"
                  >
                    Next
                  </Button>
                )}
                {currentStep === 10 && (
                  <Button
                    onClick={onGenerateReport}
                    className="bg-rectify-gradient hover:opacity-90 text-white"
                  >
                    Generate Report
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Step 1: Company Information
function CompanyInformationStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const handleInputChange = (field: string, value: string | number) => {
    updateReportData('company', {
      ...reportData.company,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Company Information</span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Basic company information as required under UAE Cabinet Resolution No. (67) of 2024</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={reportData.company.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company legal name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trade-license">Trade License Number *</Label>
            <Input
              id="trade-license"
              value={reportData.company.tradeLicense}
              onChange={(e) => handleInputChange('tradeLicense', e.target.value)}
              placeholder="e.g., CN-1234567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Company Address *</Label>
          <Textarea
            id="address"
            value={reportData.company.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Complete company address including emirate"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact-person">Contact Person *</Label>
            <Input
              id="contact-person"
              value={reportData.company.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="Authorized representative name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={reportData.company.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@company.ae"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={reportData.company.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+971 XX XXX XXXX"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Business Sector</Label>
            <Select value={reportData.company.sector} onValueChange={(value: string) => handleInputChange('sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              value={reportData.company.employees}
              onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporting-year">Reporting Year *</Label>
          <Select 
            value={reportData.company.reportingYear.toString()} 
            onValueChange={(value: string) => handleInputChange('reportingYear', parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 - i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select the calendar year for which emissions are being reported
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: Reporting Scope
function ReportingScopeStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const handleBoundaryChange = (field: string, value: any) => {
    updateReportData('reportingScope', {
      ...reportData.reportingScope,
      [field]: value
    });
  };

  const addFacility = () => {
    const newFacility = {
      id: Date.now().toString(),
      name: '',
      address: '',
      type: '',
      ownership: 100
    };
    
    const currentFacilities = reportData.reportingScope?.facilities || [];
    handleBoundaryChange('facilities', [...currentFacilities, newFacility]);
  };

  const updateFacility = (id: string, field: string, value: any) => {
    const currentFacilities = reportData.reportingScope?.facilities || [];
    const updatedFacilities = currentFacilities.map(facility =>
      facility.id === id ? { ...facility, [field]: value } : facility
    );
    handleBoundaryChange('facilities', updatedFacilities);
  };

  const removeFacility = (id: string) => {
    const currentFacilities = reportData.reportingScope?.facilities || [];
    const updatedFacilities = currentFacilities.filter(facility => facility.id !== id);
    handleBoundaryChange('facilities', updatedFacilities);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Organizational Boundary</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Define which entities are included in your emissions inventory</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Consolidation Approach *</Label>
            <Select 
              value={reportData.reportingScope.organizationalBoundary} 
              onValueChange={(value: string) => handleBoundaryChange('organizationalBoundary', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select consolidation approach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial Control</SelectItem>
                <SelectItem value="operational">Operational Control</SelectItem>
                <SelectItem value="equity">Equity Share</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Financial control is recommended for most UAE companies
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Boundary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Emission Scopes to Include *</Label>
            {[
              { value: 'scope1', label: 'Scope 1 - Direct Emissions', required: true },
              { value: 'scope2', label: 'Scope 2 - Indirect Energy Emissions', required: true },
              { value: 'scope3', label: 'Scope 3 - Other Indirect Emissions', required: false }
            ].map((scope) => (
              <div key={scope.value} className="flex items-center space-x-2">
                <Checkbox
                  id={scope.value}
                  checked={(reportData.reportingScope?.operationalBoundary || []).includes(scope.value)}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    const currentBoundary = reportData.reportingScope?.operationalBoundary || [];
                    const isChecked = checked === true;
                    if (isChecked) {
                      handleBoundaryChange('operationalBoundary', [...currentBoundary, scope.value]);
                    } else {
                      handleBoundaryChange('operationalBoundary', currentBoundary.filter(s => s !== scope.value));
                    }
                  }}
                />
                <Label htmlFor={scope.value} className="flex items-center space-x-2">
                  <span>{scope.label}</span>
                  {scope.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Facilities &amp; Operations</span>
            <Button onClick={addFacility} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(reportData.reportingScope?.facilities || []).map((facility, index) => (
            <Card key={facility.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium">Facility {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFacility(facility.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facility Name *</Label>
                  <Input
                    value={facility.name}
                    onChange={(e) => updateFacility(facility.id, 'name', e.target.value)}
                    placeholder="Facility name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Facility Type</Label>
                  <Select 
                    value={facility.type} 
                    onValueChange={(value: string) => updateFacility(facility.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing Plant</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="data-center">Data Center</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={facility.address}
                  onChange={(e) => updateFacility(facility.id, 'address', e.target.value)}
                  placeholder="Complete facility address"
                  rows={2}
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Ownership Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={facility.ownership}
                  onChange={(e) => updateFacility(facility.id, 'ownership', parseFloat(e.target.value) || 0)}
                  placeholder="100"
                />
                <p className="text-sm text-muted-foreground">
                  Percentage of facility controlled or owned by your organization
                </p>
              </div>
            </Card>
          ))}
          
          {(reportData.reportingScope?.facilities?.length || 0) === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No facilities added yet. Click "Add Facility" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Step 3: Activity Data
function ActivityDataStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const [activeScope, setActiveScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1');

  // Ensure activityData exists and has proper structure
  if (!reportData.activityData) {
    updateReportData('activityData', {
      scope1: [],
      scope2: [],
      scope3: []
    });
    return null; // Return early while data is being initialized
  }

  const addActivity = (scope: 'scope1' | 'scope2' | 'scope3') => {
    const newActivity = {
      id: Date.now().toString(),
      source: '',
      activity: scope === 'scope3' ? '' : undefined,
      category: scope === 'scope3' ? '' : undefined,
      amount: 0,
      unit: '',
      facility: ''
    };

    const currentData = reportData.activityData?.[scope] || [];
    updateReportData('activityData', {
      ...reportData.activityData,
      [scope]: [...currentData, newActivity]
    });
  };

  const updateActivity = (scope: 'scope1' | 'scope2' | 'scope3', id: string, field: string, value: any) => {
    const currentData = reportData.activityData?.[scope] || [];
    const updatedData = currentData.map((item: any) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    
    updateReportData('activityData', {
      ...reportData.activityData,
      [scope]: updatedData
    });
  };

  const removeActivity = (scope: 'scope1' | 'scope2' | 'scope3', id: string) => {
    const currentData = reportData.activityData?.[scope] || [];
    const updatedData = currentData.filter((item: any) => item.id !== id);
    
    updateReportData('activityData', {
      ...reportData.activityData,
      [scope]: updatedData
    });
  };

  const downloadCSVTemplate = () => {
    try {
      const headers = activeScope === 'scope3' 
        ? 'Emission Source,Category,Activity Description,Amount,Unit,Facility\n'
        : 'Emission Source,Activity Description,Amount,Unit,Facility\n';

      const sampleData = activeScope === 'scope1' 
        ? 'natural-gas,Office heating,1500,m3,Main Office\ndiesel,Generator fuel,500,liters,Warehouse\n'
        : activeScope === 'scope2'
        ? 'grid-electricity,Office electricity consumption,50000,kWh,Main Office\ndistrict-cooling,Office cooling,25000,kWh,Main Office\n'
        : 'business-travel,Category 6,Employee flights,5000,km,N/A\nemployee-commuting,Category 7,Daily commuting,10000,km,N/A\n';

      const csvContent = headers + sampleData;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-data-template-${activeScope}.csv`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      toast.success(`${activeScope.toUpperCase()} CSV template downloaded successfully`);
    } catch (error) {
      console.error('Error downloading CSV template:', error);
      toast.error('Failed to download CSV template. Please try again.');
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please select a valid CSV file');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target && typeof e.target.result === 'string') ? e.target.result : '';
        if (!text) {
          toast.error('Failed to read file content');
          return;
        }

        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          toast.error('CSV file must contain headers and at least one data row');
          return;
        }
        
        const headerLine = lines[0] ?? '';
        if (!headerLine) {
          toast.error('Missing CSV header row');
          return;
        }
        const headers = headerLine.split(',').map(h => h.trim());
        
        const newActivities = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(val => val.trim());
          
          if (activeScope === 'scope3') {
            return {
              id: `${Date.now()}-${index}`,
              source: values[0] ?? '',
              category: values[1] ?? '',
              activity: values[2] ?? '',
              amount: parseFloat(values[3] ?? '0') || 0,
              unit: values[4] ?? ''
            };
          } else {
            return {
              id: `${Date.now()}-${index}`,
              source: values[0] ?? '',
              activity: values[1] ?? '',
              amount: parseFloat(values[2] ?? '0') || 0,
              unit: values[3] ?? '',
              facility: values[4] ?? ''
            };
          }
        }).filter(activity => activity.source); // Filter out empty rows
        
        if (newActivities.length === 0) {
          toast.error('No valid data found in CSV file');
          return;
        }
        
        const currentData = reportData.activityData?.[activeScope] || [];
        updateReportData('activityData', {
          ...reportData.activityData,
          [activeScope]: [...currentData, ...newActivities]
        });
        
        toast.success(`Successfully imported ${newActivities.length} activities from CSV`);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file. Please check the format and try again.');
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read the file. Please try again.');
    };
    
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Activity Data Collection</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Collect quantitative data for all emission sources across your facilities</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { key: 'scope1', label: 'Scope 1', description: 'Direct emissions from owned sources' },
              { key: 'scope2', label: 'Scope 2', description: 'Electricity, heating, cooling' },
              { key: 'scope3', label: 'Scope 3', description: 'Other indirect emissions' }
            ].map((scope) => (
              <Button
                key={scope.key}
                variant={activeScope === scope.key ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-start ${
                  activeScope === scope.key ? 'bg-rectify-green hover:bg-rectify-green-dark' : ''
                }`}
                onClick={() => setActiveScope(scope.key as any)}
              >
                <span className="font-medium">{scope.label}</span>
                <span className="text-xs text-left mt-1 opacity-80">{scope.description}</span>
              </Button>
            ))}
          </div>

          {/* CSV Import/Export Information */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Bulk Data Import</h4>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              For large datasets, use CSV import for faster data entry:
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-600">
              <span>1. Download template</span>
              <span>2. Fill with your data</span>
              <span>3. Upload completed CSV</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {activeScope === 'scope1' && 'Scope 1 - Direct Emissions'}
              {activeScope === 'scope2' && 'Scope 2 - Energy Indirect Emissions'} 
              {activeScope === 'scope3' && 'Scope 3 - Other Indirect Emissions'}
            </h3>
            <div className="flex space-x-2">
              <Button onClick={downloadCSVTemplate} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <label htmlFor={`csv-upload-${activeScope}`}>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </span>
                </Button>
                <input
                  id={`csv-upload-${activeScope}`}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
              <Button onClick={() => addActivity(activeScope)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {(reportData.activityData?.[activeScope] || []).map((activity: any, index: number) => (
              <Card key={activity.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium">Activity {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActivity(activeScope, activity.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emission Source *</Label>
                    <Input
                      value={activity.source}
                      onChange={(e) => updateActivity(activeScope, activity.id, 'source', e.target.value)}
                      placeholder="e.g., natural-gas, grid-electricity"
                    />
                  </div>
                  
                  {activeScope === 'scope3' && (
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select 
                        value={activity.category} 
                        onValueChange={(value: string) => updateActivity(activeScope, activity.id, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Category 1">Category 1 - Purchased goods and services</SelectItem>
                          <SelectItem value="Category 2">Category 2 - Capital goods</SelectItem>
                          <SelectItem value="Category 3">Category 3 - Fuel and energy related activities</SelectItem>
                          <SelectItem value="Category 4">Category 4 - Upstream transportation</SelectItem>
                          <SelectItem value="Category 5">Category 5 - Waste generated in operations</SelectItem>
                          <SelectItem value="Category 6">Category 6 - Business travel</SelectItem>
                          <SelectItem value="Category 7">Category 7 - Employee commuting</SelectItem>
                          <SelectItem value="Category 8">Category 8 - Upstream leased assets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Activity Description *</Label>
                    <Input
                      value={activity.activity}
                      onChange={(e) => updateActivity(activeScope, activity.id, 'activity', e.target.value)}
                      placeholder="Describe the activity"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={activity.amount}
                      onChange={(e) => updateActivity(activeScope, activity.id, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <Select 
                      value={activity.unit} 
                      onValueChange={(value: string) => updateActivity(activeScope, activity.id, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeScope === 'scope1' && (
                          <>
                            <SelectItem value="m³">m³ (Cubic meters)</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="tonnes">Tonnes</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="km">Kilometers</SelectItem>
                          </>
                        )}
                        {activeScope === 'scope2' && (
                          <>
                            <SelectItem value="kWh">kWh</SelectItem>
                            <SelectItem value="MWh">MWh</SelectItem>
                            <SelectItem value="GJ">GJ (Gigajoules)</SelectItem>
                          </>
                        )}
                        {activeScope === 'scope3' && (
                          <>
                            <SelectItem value="km">Kilometers</SelectItem>
                            <SelectItem value="tonnes">Tonnes</SelectItem>
                            <SelectItem value="m³">m³ (Cubic meters)</SelectItem>
                            <SelectItem value="AED">AED (spending)</SelectItem>
                            <SelectItem value="USD">USD (spending)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {activeScope !== 'scope3' && (
                    <div className="space-y-2">
                      <Label>Facility</Label>
                      <Select 
                        value={activity.facility} 
                        onValueChange={(value: string) => updateActivity(activeScope, activity.id, 'facility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility" />
                        </SelectTrigger>
                        <SelectContent>
                          {(reportData.reportingScope?.facilities || []).map((facility) => (
                            <SelectItem key={facility.id} value={facility.name}>
                              {facility.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            
            {(reportData.activityData?.[activeScope]?.length || 0) === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity data added yet for {activeScope.toUpperCase()}.</p>
                <p className="text-sm">Use the buttons above to add activities manually or import from CSV.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 4: Emission Factors
function EmissionFactorsStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const [activeScope, setActiveScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1');

  // Ensure emissionFactors exists
  if (!reportData.emissionFactors) {
    updateReportData('emissionFactors', {
      scope1Factors: [],
      scope2Factors: [],
      scope3Factors: []
    });
    return null;
  }

  const currentFactors = activeScope === 'scope1' 
    ? reportData.emissionFactors.scope1Factors || []
    : activeScope === 'scope2' 
    ? reportData.emissionFactors.scope2Factors || []
    : reportData.emissionFactors.scope3Factors || [];

  const addFactor = (factor: any) => {
    const factorKey = `${activeScope}Factors` as keyof typeof reportData.emissionFactors;
    const currentFactors = reportData.emissionFactors[factorKey] || [];
    
    updateReportData('emissionFactors', {
      ...reportData.emissionFactors,
      [factorKey]: [...currentFactors, factor]
    });
  };

  const removeFactor = (id: string) => {
    const factorKey = `${activeScope}Factors` as keyof typeof reportData.emissionFactors;
    const currentFactors = reportData.emissionFactors[factorKey] || [];
    
    updateReportData('emissionFactors', {
      ...reportData.emissionFactors,
      [factorKey]: currentFactors.filter((factor: any) => factor.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>UAE Emission Factors</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Apply UAE-certified emission factors to calculate your emissions</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { key: 'scope1', label: 'Scope 1' },
              { key: 'scope2', label: 'Scope 2' },
              { key: 'scope3', label: 'Scope 3' }
            ].map((scope) => (
              <Button
                key={scope.key}
                variant={activeScope === scope.key ? "default" : "outline"}
                className={activeScope === scope.key ? 'bg-rectify-green hover:bg-rectify-green-dark' : ''}
                onClick={() => setActiveScope(scope.key as any)}
              >
                {scope.label}
              </Button>
            ))}
          </div>

          <UAEEmissionsCalculator
            activeScope={activeScope}
            onAddFactor={addFactor}
            existingFactors={currentFactors}
            onRemoveFactor={removeFactor}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Step 5: Calculations
function CalculationsStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const [isCalculating, setIsCalculating] = useState(false);

  // Clear any existing calculations that don't have a calculatedAt timestamp
  useEffect(() => {
    if (reportData.calculations && !reportData.calculations.calculatedAt) {
      clearCalculations();
    }
  }, []);

  // Clear calculations when activity data changes
  useEffect(() => {
    if (hasCalculations && reportData.activityData) {
      // Clear calculations if activity data has changed since last calculation
      clearCalculations();
    }
  }, [reportData.activityData]);

  const hasActivityData = () => {
    const scope1Data = reportData.activityData?.scope1?.length > 0;
    const scope2Data = reportData.activityData?.scope2?.length > 0;
    const scope3Data = reportData.activityData?.scope3?.length > 0;
    
    return scope1Data || scope2Data || scope3Data;
  };

  const clearCalculations = () => {
    updateReportData('calculations', {
      scope1Total: 0,
      scope2Total: 0,
      scope3Total: 0,
      totalEmissions: 0,
      emissionsByFacility: [],
      emissionsByCategory: []
    });
  };

  const validateActivityData = () => {
    const issues = [];
    
    // Check if activity data exists
    if (!reportData.activityData) {
      issues.push('No activity data found. Please add activity data in Step 3.');
      return issues;
    }
    
    // Check each scope for valid data
    ['scope1', 'scope2', 'scope3'].forEach(scope => {
      const activities = reportData.activityData[scope as keyof typeof reportData.activityData];
      if (activities && activities.length > 0) {
        activities.forEach((activity: any, index: number) => {
          if (!activity.source || activity.source.trim() === '') {
            issues.push(`${scope.toUpperCase()} Activity ${index + 1}: Missing emission source`);
          }
          if (!activity.amount || activity.amount <= 0) {
            issues.push(`${scope.toUpperCase()} Activity ${index + 1}: Invalid amount (must be > 0)`);
          }
          if (!activity.unit || activity.unit.trim() === '') {
            issues.push(`${scope.toUpperCase()} Activity ${index + 1}: Missing unit`);
          }
        });
      }
    });
    
    return issues;
  };

  const calculateEmissions = () => {
    setIsCalculating(true);
    
    // Validate data first
    const validationIssues = validateActivityData();
    if (validationIssues.length > 0) {
      setIsCalculating(false);
      toast.error(`Validation errors: ${validationIssues.join(', ')}`);
      return;
    }
    
    // Simulate calculation delay
    setTimeout(() => {
      try {
        // Calculate emissions based on activity data and emission factors
        let scope1Total = 0;
        let scope2Total = 0;
        let scope3Total = 0;

        // UAE Emission Factors Database (same as in UAEEmissionsCalculator)
        const uaeEmissionFactors = {
          scope1: {
            'natural-gas': { factor: 0.0184, unit: 'tCO₂e/m³' },
            'diesel': { factor: 2.67, unit: 'tCO₂e/m³' },
            'gasoline': { factor: 2.31, unit: 'tCO₂e/m³' },
            'lpg': { factor: 1.51, unit: 'tCO₂e/tonne' },
            'fleet-vehicles': { factor: 0.171, unit: 'kgCO₂e/km' }
          },
          scope2: {
            'grid-electricity': { factor: 0.4772, unit: 'tCO₂e/MWh' },
            'district-cooling': { factor: 0.5892, unit: 'tCO₂e/MWh' },
            'district-heating': { factor: 0.2156, unit: 'tCO₂e/MWh' }
          },
          scope3: {
            'business-travel': { factor: 0.255, unit: 'kgCO₂e/km' },
            'employee-commuting': { factor: 0.171, unit: 'kgCO₂e/km' },
            'waste': { factor: 0.0211, unit: 'tCO₂e/tonne' },
            'water': { factor: 0.344, unit: 'kgCO₂e/m³' }
          }
        };

        // Calculate Scope 1 emissions
        if (reportData.activityData?.scope1) {
          scope1Total = reportData.activityData.scope1.reduce((total: number, activity: any) => {
            const factorData = uaeEmissionFactors.scope1[activity.source as keyof typeof uaeEmissionFactors.scope1];
            if (factorData && activity.amount > 0) {
              let emissions = activity.amount * factorData.factor;
              
              // Unit conversions
              if (factorData.unit.includes('kg') && activity.unit === 'km') {
                emissions = emissions / 1000; // Convert kg to tonnes
              }
              
              return total + emissions;
            }
            return total;
          }, 0);
        }

        // Calculate Scope 2 emissions
        if (reportData.activityData?.scope2) {
          scope2Total = reportData.activityData.scope2.reduce((total: number, activity: any) => {
            const factorData = uaeEmissionFactors.scope2[activity.source as keyof typeof uaeEmissionFactors.scope2];
            if (factorData && activity.amount > 0) {
              let emissions = activity.amount * factorData.factor;
              
              // Unit conversions
              if (activity.unit === 'kWh' && factorData.unit.includes('MWh')) {
                emissions = emissions / 1000; // Convert kWh to MWh
              }
              
              return total + emissions;
            }
            return total;
          }, 0);
        }

        // Calculate Scope 3 emissions
        if (reportData.activityData?.scope3) {
          scope3Total = reportData.activityData.scope3.reduce((total: number, activity: any) => {
            const factorData = uaeEmissionFactors.scope3[activity.source as keyof typeof uaeEmissionFactors.scope3];
            if (factorData && activity.amount > 0) {
              let emissions = activity.amount * factorData.factor;
              
              // Unit conversions
              if (factorData.unit.includes('kg') && activity.unit === 'km') {
                emissions = emissions / 1000; // Convert kg to tonnes
              }
              
              return total + emissions;
            }
            return total;
          }, 0);
        }

        const totalEmissions = scope1Total + scope2Total + scope3Total;

        // Calculate emissions by facility
        const emissionsByFacility = (reportData.reportingScope?.facilities || []).map((facility) => {
          // Calculate facility-specific emissions based on activities assigned to each facility
          let facilityScope1 = 0;
          let facilityScope2 = 0;

          // Scope 1 facility emissions
          if (reportData.activityData?.scope1) {
            facilityScope1 = reportData.activityData.scope1
              .filter((activity: any) => activity.facility === facility.name)
              .reduce((total: number, activity: any) => {
                const factorData = uaeEmissionFactors.scope1[activity.source as keyof typeof uaeEmissionFactors.scope1];
                if (factorData && activity.amount > 0) {
                  let emissions = activity.amount * factorData.factor;
                  if (factorData.unit.includes('kg') && activity.unit === 'km') {
                    emissions = emissions / 1000;
                  }
                  return total + emissions;
                }
                return total;
              }, 0);
          }

          // Scope 2 facility emissions
          if (reportData.activityData?.scope2) {
            facilityScope2 = reportData.activityData.scope2
              .filter((activity: any) => activity.facility === facility.name)
              .reduce((total: number, activity: any) => {
                const factorData = uaeEmissionFactors.scope2[activity.source as keyof typeof uaeEmissionFactors.scope2];
                if (factorData && activity.amount > 0) {
                  let emissions = activity.amount * factorData.factor;
                  if (activity.unit === 'kWh' && factorData.unit.includes('MWh')) {
                    emissions = emissions / 1000;
                  }
                  return total + emissions;
                }
                return total;
              }, 0);
          }

          const facilityTotal = facilityScope1 + facilityScope2;
          
          return {
            facility: facility.name,
            scope1: facilityScope1 * (facility.ownership / 100),
            scope2: facilityScope2 * (facility.ownership / 100),
            total: facilityTotal * (facility.ownership / 100)
          };
        });

        // Calculate emissions by category
        const emissionsByCategory = [
          { 
            category: 'Direct Emissions (Scope 1)', 
            amount: scope1Total, 
            percentage: totalEmissions > 0 ? (scope1Total / totalEmissions) * 100 : 0 
          },
          { 
            category: 'Energy Indirect (Scope 2)', 
            amount: scope2Total, 
            percentage: totalEmissions > 0 ? (scope2Total / totalEmissions) * 100 : 0 
          },
          { 
            category: 'Other Indirect (Scope 3)', 
            amount: scope3Total, 
            percentage: totalEmissions > 0 ? (scope3Total / totalEmissions) * 100 : 0 
          }
        ];

        updateReportData('calculations', {
          scope1Total,
          scope2Total,
          scope3Total,
          totalEmissions,
          emissionsByFacility,
          emissionsByCategory,
          calculatedAt: new Date().toISOString()
        });

        setIsCalculating(false);
        toast.success('Emissions calculated successfully!');
      } catch (error) {
        console.error('Error calculating emissions:', error);
        setIsCalculating(false);
        toast.error('Error calculating emissions. Please check your data and try again.');
      }
    }, 2000);
  };

  const hasCalculations = reportData.calculations?.calculatedAt && reportData.calculations?.totalEmissions >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Emission Calculations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <Button
            onClick={calculateEmissions}
            disabled={isCalculating || !hasActivityData()}
            className="bg-rectify-green hover:bg-rectify-green-dark"
            size="lg"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                {hasActivityData() ? 'Calculate Total Emissions' : 'Add Activity Data First'}
              </>
            )}
          </Button>
          
          {hasCalculations && (
            <Button
              onClick={clearCalculations}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Clear Calculations
            </Button>
          )}
        </div>

        {hasCalculations && (
          <div className="space-y-6">
            {/* Calculation Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Calculation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Scope 1 Activities:</strong> {reportData.activityData?.scope1?.length || 0}
                  </div>
                  <div>
                    <strong>Scope 2 Activities:</strong> {reportData.activityData?.scope2?.length || 0}
                  </div>
                  <div>
                    <strong>Scope 3 Activities:</strong> {reportData.activityData?.scope3?.length || 0}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Calculations based on UAE-certified emission factors from DEWA, ADNOC, and UAE Ministry of Energy
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.calculations.scope1Total.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 1 (tCO₂e)</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.calculations.scope2Total.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 2 (tCO₂e)</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reportData.calculations.scope3Total.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 3 (tCO₂e)</div>
              </Card>
              
              <Card className="p-4 text-center bg-rectify-accent">
                <div className="text-2xl font-bold text-rectify-green">
                  {reportData.calculations?.calculatedAt ? reportData.calculations.totalEmissions.toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Total (tCO₂e)</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emissions by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.calculations.emissionsByCategory.map((category) => (
                      <div key={category.category} className="flex justify-between items-center">
                        <span className="text-sm">{category.category}</span>
                        <div className="text-right">
                          <div className="font-medium">{category.amount.toFixed(2)} tCO₂e</div>
                          <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emissions by Facility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.calculations.emissionsByFacility.map((facility) => (
                      <div key={facility.facility} className="space-y-1">
                        <div className="font-medium">{facility.facility}</div>
                        <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2">
                          <span>S1: {facility.scope1.toFixed(1)}</span>
                          <span>S2: {facility.scope2.toFixed(1)}</span>
                          <span>Total: {facility.total.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!hasCalculations && (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {hasActivityData() 
                ? 'Click "Calculate Total Emissions" to process your activity data and generate emission totals.'
                : 'Add activity data in Step 3 before calculating emissions.'
              }
            </p>
            {hasActivityData() && (
              <p className="text-sm mt-2">
                No calculations have been performed yet. All values will start at 0.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Step 6: Reductions & Credits
function ReductionsCreditsStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  // Ensure reductionsCredits exists
  if (!reportData.reductionsCredits) {
    updateReportData('reductionsCredits', {
      reductionMeasures: [],
      nrccCredits: [],
      netEmissions: reportData.calculations?.totalEmissions || 0
    });
    return null;
  }

  const addReductionMeasure = () => {
    const newMeasure = {
      id: Date.now().toString(),
      measure: '',
      description: '',
      reductionAmount: 0,
      implementation: ''
    };

    const currentMeasures = reportData.reductionsCredits?.reductionMeasures || [];
    updateReportData('reductionsCredits', {
      ...reportData.reductionsCredits,
      reductionMeasures: [...currentMeasures, newMeasure]
    });
  };

  const updateReductionMeasure = (id: string, field: string, value: any) => {
    const currentMeasures = reportData.reductionsCredits?.reductionMeasures || [];
    const updatedMeasures = currentMeasures.map(measure =>
      measure.id === id ? { ...measure, [field]: value } : measure
    );

    updateReportData('reductionsCredits', {
      ...reportData.reductionsCredits,
      reductionMeasures: updatedMeasures
    });
  };

  const removeReductionMeasure = (id: string) => {
    const currentMeasures = reportData.reductionsCredits?.reductionMeasures || [];
    const updatedMeasures = currentMeasures.filter(measure => measure.id !== id);

    updateReportData('reductionsCredits', {
      ...reportData.reductionsCredits,
      reductionMeasures: updatedMeasures
    });
  };

  const totalReductions = (reportData.reductionsCredits?.reductionMeasures || [])
    .reduce((sum, measure) => sum + measure.reductionAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-rectify-accent border-rectify-green">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-rectify-green">
            <Leaf className="h-5 w-5" />
            <span>Emission Reductions Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {reportData.calculations?.calculatedAt ? (reportData.calculations?.totalEmissions || 0).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-muted-foreground">Gross Emissions (tCO₂e)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                -{totalReductions.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Reduction Measures (tCO₂e)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rectify-green">
                {reportData.calculations?.calculatedAt ? ((reportData.calculations?.totalEmissions || 0) - totalReductions).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-muted-foreground">Net Emissions (tCO₂e)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reduction Measures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Emission Reduction Measures</span>
            <Button onClick={addReductionMeasure} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Measure
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(reportData.reductionsCredits?.reductionMeasures || []).map((measure, index) => (
            <Card key={measure.id} className="p-4 bg-blue-50">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium">Reduction Measure {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReductionMeasure(measure.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Measure Name *</Label>
                  <Input
                    value={measure.measure}
                    onChange={(e) => updateReductionMeasure(measure.id, 'measure', e.target.value)}
                    placeholder="e.g., LED lighting upgrade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Estimated Reduction (tCO₂e) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={measure.reductionAmount}
                    onChange={(e) => updateReductionMeasure(measure.id, 'reductionAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={measure.description}
                  onChange={(e) => updateReductionMeasure(measure.id, 'description', e.target.value)}
                  placeholder="Describe the reduction measure and methodology"
                  rows={2}
                />
              </div>
            </Card>
          ))}
          
          {(reportData.reductionsCredits?.reductionMeasures?.length || 0) === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reduction measures added yet.</p>
              <p className="text-sm">Document your emission reduction initiatives and their estimated impact.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Step 7: Verification
function VerificationStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const handleVerificationChange = (field: string, value: any) => {
    try {
      updateReportData('verification', {
        ...reportData.verification,
        [field]: value
      });
    } catch (error) {
      console.error('Error updating verification field:', error);
      toast.error('Error updating verification data. Please try again.');
    }
  };

  const handleVerificationTypeChange = (type: 'none' | 'third-party') => {
    try {
      updateReportData('verification', {
        ...reportData.verification,
        verificationRequired: type === 'third-party',
        verificationType: type
      });
    } catch (error) {
      console.error('Error updating verification type:', error);
      toast.error('Error updating verification type. Please try again.');
    }
  };

  // Add null checks to prevent undefined access
  if (!reportData || !reportData.verification) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading verification data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  try {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Verification</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose whether your emissions report will undergo third-party verification
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Verification Type</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  id="verification-none"
                  name="verification-type"
                  value="none"
                  checked={reportData.verification?.verificationType === 'none' || (!reportData.verification?.verificationRequired && !reportData.verification?.verificationType)}
                  onChange={() => handleVerificationTypeChange('none')}
                  className="h-4 w-4 text-rectify-green"
                />
                <Label htmlFor="verification-none" className="flex-1 cursor-pointer">
                  <div className="font-medium">No Third-Party Verification</div>
                  <div className="text-sm text-muted-foreground">
                    Self-declaration without external verification
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  id="verification-third-party"
                  name="verification-type"
                  value="third-party"
                  checked={reportData.verification?.verificationType === 'third-party' || reportData.verification?.verificationRequired === true}
                  onChange={() => handleVerificationTypeChange('third-party')}
                  className="h-4 w-4 text-rectify-green"
                />
                <Label htmlFor="verification-third-party" className="flex-1 cursor-pointer">
                  <div className="font-medium">Third-Party Verification</div>
                  <div className="text-sm text-muted-foreground">
                    Independent verification by accredited verification body
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {reportData.verification?.verificationType === 'third-party' && (
            <div className="space-y-4 ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Third-Party Verification Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="verifier-name">Verification Body Name *</Label>
                  <Input
                    id="verifier-name"
                    value={reportData.verification?.verifierName || ''}
                    onChange={(e) => handleVerificationChange('verifierName', e.target.value)}
                    placeholder="Name of accredited verification body"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verifier-email">Verifier Email *</Label>
                  <Input
                    id="verifier-email"
                    type="email"
                    value={reportData.verification?.verifierEmail || ''}
                    onChange={(e) => handleVerificationChange('verifierEmail', e.target.value)}
                    placeholder="verifier@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verifier-accreditation">Accreditation Standard *</Label>
                  <Select 
                    value={reportData.verification?.verifierAccreditation || ''} 
                    onValueChange={(value: string) => handleVerificationChange('verifierAccreditation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accreditation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso-14065">ISO 14065</SelectItem>
                      <SelectItem value="uae-accredited">UAE Accredited Verifier</SelectItem>
                      <SelectItem value="cdp-approved">CDP Approved Verifier</SelectItem>
                      <SelectItem value="other">Other International Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-date">Expected Verification Date</Label>
                  <Input
                    id="verification-date"
                    type="date"
                    value={reportData.verification?.verificationDate || ''}
                    onChange={(e) => handleVerificationChange('verificationDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {reportData.verification?.verificationType === 'none' && (
            <div className="ml-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-gray-900 mb-1">Self-Declaration Notice</p>
                  <p>Your report will be submitted as a self-declaration without third-party verification. This is acceptable for initial compliance reporting, but third-party verification may be required for certain regulatory purposes or stakeholder assurance.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    );
  } catch (error) {
    console.error('Error in VerificationStep:', error);
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading verification step</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

// Step 8: Declarations
function DeclarationsStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const handleDeclarationChange = (field: string, value: any) => {
    updateReportData('declarations', {
      ...reportData.declarations,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Management Declarations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="accuracy-declaration"
              checked={reportData.declarations?.accuracyDeclaration || false}
              onCheckedChange={(checked: boolean | "indeterminate") => handleDeclarationChange('accuracyDeclaration', checked === true)}
              className="mt-1"
            />
            <Label htmlFor="accuracy-declaration" className="text-sm leading-relaxed">
              <strong>Declaration of Accuracy:</strong> I declare that the information contained in this emissions report is accurate and complete to the best of my knowledge and belief.
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="completeness-declaration"
              checked={reportData.declarations?.completenessDeclaration || false}
              onCheckedChange={(checked: boolean | "indeterminate") => handleDeclarationChange('completenessDeclaration', checked === true)}
              className="mt-1"
            />
            <Label htmlFor="completeness-declaration" className="text-sm leading-relaxed">
              <strong>Declaration of Completeness:</strong> I confirm that all material emission sources have been identified and included in accordance with the reporting requirements.
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="compliance-declaration"
              checked={reportData.declarations?.complianceDeclaration || false}
              onCheckedChange={(checked: boolean | "indeterminate") => handleDeclarationChange('complianceDeclaration', checked === true)}
              className="mt-1"
            />
            <Label htmlFor="compliance-declaration" className="text-sm leading-relaxed">
              <strong>Declaration of Compliance:</strong> I acknowledge that this report has been prepared in compliance with Federal Decree-Law No. (11) of 2024.
            </Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Authorized Signatory Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorized-signatory">Full Name *</Label>
              <Input
                id="authorized-signatory"
                value={reportData.declarations?.authorizedSignatory || ''}
                onChange={(e) => handleDeclarationChange('authorizedSignatory', e.target.value)}
                placeholder="Full name of authorized signatory"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position/Title *</Label>
              <Input
                id="position"
                value={reportData.declarations?.position || ''}
                onChange={(e) => handleDeclarationChange('position', e.target.value)}
                placeholder="e.g., Chief Executive Officer"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="declaration-date">Declaration Date *</Label>
            <Input
              id="declaration-date"
              type="date"
              value={reportData.declarations?.date || ''}
              onChange={(e) => handleDeclarationChange('date', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 9: Attachments
function AttachmentsStep({ reportData, updateReportData }: { reportData: EmissionsReportData, updateReportData: (section: keyof EmissionsReportData, data: any) => void }) {
  const handleFileUpload = (attachmentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      event.target.value = '';
      return;
    }

    // Update attachment as uploaded
    const updatedAttachments = (reportData.attachments || []).map(attachment =>
      attachment.id === attachmentId
        ? {
            ...attachment,
            uploaded: true,
            fileName: file.name,
            fileSize: file.size,
            uploadDate: new Date().toISOString().split('T')[0]
          }
        : attachment
    );

    updateReportData('attachments', updatedAttachments);
    toast.success(`${file.name} uploaded successfully`);
    
    // Reset the input
    event.target.value = '';
  };

  const handleFileRemove = (attachmentId: string) => {
    const updatedAttachments = (reportData.attachments || []).map(attachment =>
      attachment.id === attachmentId
        ? {
            ...attachment,
            uploaded: false,
            fileName: undefined,
            fileSize: undefined,
            uploadDate: undefined
          }
        : attachment
    );

    updateReportData('attachments', updatedAttachments);
    toast.success('File removed successfully');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Paperclip className="h-5 w-5" />
          <span>Supporting Documents</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {(reportData.attachments || []).map((attachment) => (
            <Card key={attachment.id} className={`p-4 ${attachment.required ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{attachment.name}</h4>
                    {attachment.required && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Required
                      </Badge>
                    )}
                    {attachment.uploaded && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{attachment.description}</p>
                  
                  {attachment.uploaded && attachment.fileName && (
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>File:</strong> {attachment.fileName}</p>
                      <p><strong>Size:</strong> {attachment.fileSize ? formatFileSize(attachment.fileSize) : 'Unknown'}</p>
                      <p><strong>Uploaded:</strong> {attachment.uploadDate}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {!attachment.uploaded ? (
                    <label htmlFor={`file-upload-${attachment.id}`}>
                      <Button size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                      <input
                        id={`file-upload-${attachment.id}`}
                        type="file"
                        accept=".pdf,.xlsx,.xls,.docx,.doc,.csv"
                        onChange={(e) => handleFileUpload(attachment.id, e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileRemove(attachment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Step 10: Review
function ReviewStep({ reportData, onGenerateReport, isStepComplete }: { reportData: EmissionsReportData, onGenerateReport: () => void, isStepComplete: (stepId: number) => boolean }) {
  // Ensure all required data exists to prevent crashes
  if (!reportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Report Review & Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No report data available. Please start from the beginning.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use the same completion calculation as the main component
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

  try {
    const completionPercentage = calculateReportCompletion();
    
    // Get required attachments for canGenerateReport check
    const requiredAttachments = (reportData.attachments || []).filter(a => a.required);
    const uploadedRequiredAttachments = requiredAttachments.filter(a => a.uploaded);

    const canGenerateReport = completionPercentage >= 80 && // At least 80% completion
      requiredAttachments.every(a => a.uploaded) && // All required attachments
      reportData.calculations?.calculatedAt; // Has calculations

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Report Review & Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {completionPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Report Completion</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {uploadedRequiredAttachments.length}/{requiredAttachments.length}
              </div>
              <div className="text-sm text-muted-foreground">Required Documents</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-rectify-green">
                {reportData.calculations?.calculatedAt ? (reportData.calculations?.totalEmissions || 0).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-muted-foreground">Total Emissions (tCO₂e)</div>
            </Card>
          </div>

          {/* Step Completion Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { id: 1, title: "Company Information" },
                  { id: 2, title: "Reporting Scope" },
                  { id: 3, title: "Activity Data" },
                  { id: 4, title: "Emission Factors" },
                  { id: 5, title: "Calculations" },
                  { id: 6, title: "Reductions & Credits" },
                  { id: 7, title: "Verification" },
                  { id: 8, title: "Declarations" },
                  { id: 9, title: "Attachments" }
                ].map((step) => {
                  try {
                    const isComplete = isStepComplete(step.id);
                    return (
                      <div key={step.id} className="flex items-center space-x-3">
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className={isComplete ? "text-green-600" : "text-orange-500"}>
                          {step.title}
                        </span>
                      </div>
                    );
                  } catch (error) {
                    console.error(`Error checking step ${step.id} completion:`, error);
                    return (
                      <div key={step.id} className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="text-orange-500">
                          {step.title}
                        </span>
                      </div>
                    );
                  }
                })}
              </div>
            </CardContent>
          </Card>

          {/* Generation Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!canGenerateReport && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Requirements Not Met</h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                      {completionPercentage < 80 && <p>• Complete at least 80% of the report (currently {completionPercentage.toFixed(0)}%)</p>}
                      {!requiredAttachments.every(a => a.uploaded) && <p>• Upload all required supporting documents</p>}
                      {!reportData.calculations?.calculatedAt && <p>• Calculate total emissions in Step 5</p>}
                    </div>
                  </div>
                )}

                <Button
                  onClick={onGenerateReport}
                  disabled={!canGenerateReport}
                  size="lg"
                  className="w-full bg-rectify-gradient hover:opacity-90 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate UAE Emissions Report
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  This will generate a professional PDF report compliant with UAE Federal Decree-Law No. (11) of 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
  } catch (error) {
    console.error('Error in ReviewStep:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Error Loading Review Step</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>There was an error loading the review step.</p>
            <p className="text-sm mt-2">Please try refreshing the page or go back to a previous step.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}