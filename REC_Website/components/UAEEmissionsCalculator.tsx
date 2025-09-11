import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Alert, AlertDescription } from "./ui/alert";

import { 
  Plus, 
  Info, 
  Zap, 
  Table, 
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  getFactorsByScope, 
  calculateEmissions, 
  factorAppliesToActivity,
  formatFactorName,
  formatFactorValue,
  getSuggestedFactors,
  validateFactorSelection,
  type EmissionFactor,
  type AppliedFactor
} from "../lib/factors";

interface UAEEmissionsCalculatorProps {
  activeScope: 'scope1' | 'scope2' | 'scope3';
  onAddFactor: (factor: AppliedFactor) => void;
  existingFactors: AppliedFactor[];
  onRemoveFactor: (id: string) => void;
  activityData?: any; // For auto-mapping preview
}

export function UAEEmissionsCalculator({ 
  activeScope, 
  onAddFactor, 
  existingFactors,
  onRemoveFactor,
  activityData
}: UAEEmissionsCalculatorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customFactorInputs, setCustomFactorInputs] = useState<Record<string, { value: string; unit: string }>>({});
  const [isFactorLibraryExpanded, setIsFactorLibraryExpanded] = useState(false);
  const [isGuidelinesVisible, setIsGuidelinesVisible] = useState(true);
  const [isTipsVisible, setIsTipsVisible] = useState(true);

  // Get available factors for current scope
  const availableFactors = getFactorsByScope(activeScope);
  console.log('Available factors for', activeScope, ':', availableFactors.length, availableFactors.map(f => f.id));
  console.log('All factors:', availableFactors);

  const filteredFactors = availableFactors.filter(factor =>
    factor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factor.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get factors that apply to a specific activity
  const getApplicableFactors = (activity: any) => {
    return availableFactors.filter(factor => 
      factorAppliesToActivity(factor, activity.source, activity.unit)
    );
  };

  // Get suggested factors for an activity
  const getSuggestedFactorsForActivity = (activity: any) => {
    return getSuggestedFactors(activity.source, activity.unit, activeScope);
  };

  // Handle factor selection
  const handleFactorSelection = (activity: any, factorId: string) => {
    // Remove existing factor for this activity if it exists
    const existingFactor = existingFactors.find(f => 
      f.activityAmount === activity.amount && 
      f.activityUnit === activity.unit &&
      f.factor.applies_to.some(applies => applies.source === activity.source)
    );
    
    if (existingFactor) {
      onRemoveFactor(existingFactor.id);
    }

    if (factorId === 'custom') {
      // Initialize custom factor input for this activity
      const activityKey = `${activity.amount}-${activity.unit}-${activity.source}`;
      setCustomFactorInputs(prev => ({
        ...prev,
        [activityKey]: { value: '', unit: 'tCO₂e/unit' }
      }));
    } else if (factorId && factorId !== '') {
      const selectedFactor = availableFactors.find(f => f.id === factorId);
      if (selectedFactor) {
        // Validate the factor selection (but allow manual selections)
        const validation = validateFactorSelection(selectedFactor, activity.source, activity.unit);
        
        // Only block if there are critical errors (not just warnings)
        if (!validation.isValid && validation.errors.length > 0) {
          toast.error(`Cannot apply factor: ${validation.errors.join(', ')}`);
          return;
        }
        
        // Show warnings if any (but don't block the selection)
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(warning => {
            toast.warning(warning);
          });
        }
        
        // Show info message for manual selections
        if (!validation.isValid && validation.errors.length === 0) {
          toast.info('Manual factor selection applied. Please verify the compatibility in your final report.');
        }
        
        const appliedFactor: AppliedFactor = {
          id: `${selectedFactor.id}-${activity.source}-${Date.now()}`,
          factor: selectedFactor,
          activityAmount: activity.amount,
          activityUnit: activity.unit,
          calculatedEmissions: calculateEmissions(activity.amount, activity.unit, selectedFactor),
          appliedAt: new Date().toISOString()
        };
        onAddFactor(appliedFactor);
        toast.success(`Factor "${formatFactorName(selectedFactor)}" applied successfully`);
      } else {
        console.error('Factor not found for value:', factorId);
        toast.error('Selected factor not found. Please try again.');
      }
    }
  };

  // Get current factor for an activity
  const getCurrentFactor = (activity: any) => {
    return existingFactors.find(f => 
      f.activityAmount === activity.amount && 
      f.activityUnit === activity.unit &&
      f.factor.applies_to.some(applies => applies.source === activity.source)
    );
  };

  // Get current factor ID for dropdown value
  const getCurrentFactorId = (activity: any) => {
    const currentFactor = getCurrentFactor(activity);
    const activityKey = `${activity.amount}-${activity.unit}-${activity.source}`;
    
    // If custom input is active, return 'custom'
    if (customFactorInputs[activityKey]) {
      return 'custom';
    }
    
    return currentFactor?.factor.id || '';
  };

  // Handle custom factor submission
  const handleCustomFactorSubmit = (activity: any) => {
    const activityKey = `${activity.amount}-${activity.unit}-${activity.source}`;
    const customInput = customFactorInputs[activityKey];
    
    if (!customInput || !customInput.value || isNaN(parseFloat(customInput.value))) {
      toast.error('Please enter a valid custom emission factor value');
      return;
    }

    const customFactor: AppliedFactor = {
      id: `custom-${activity.source}-${Date.now()}`,
      factor: {
        id: 'custom',
        scope: activeScope,
        name: `Custom Factor (${activity.source})`,
        year: '2024',
        factor_value: parseFloat(customInput.value),
        unit: customInput.unit,
        applies_to: [{ source: activity.source, units: [activity.unit] }],
        source: 'Custom Input',
        notes: 'User-defined emission factor',
        certified: false
      },
      activityAmount: activity.amount,
      activityUnit: activity.unit,
      calculatedEmissions: activity.amount * parseFloat(customInput.value),
      appliedAt: new Date().toISOString()
    };
    
    onAddFactor(customFactor);
    
    // Clear custom input
    setCustomFactorInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[activityKey];
      return newInputs;
    });
    
    toast.success('Custom factor added successfully');
  };

  // Handle custom factor input changes
  const handleCustomFactorChange = (activity: any, field: 'value' | 'unit', newValue: string) => {
    const activityKey = `${activity.amount}-${activity.unit}-${activity.source}`;
    setCustomFactorInputs(prev => ({
      ...prev,
      [activityKey]: {
        value: field === 'value' ? newValue : prev[activityKey]?.value || '',
        unit: field === 'unit' ? newValue : prev[activityKey]?.unit || 'tCO₂e/unit'
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Auto-Detected Activity Factors */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Auto-Detected Activity Factors</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Automatically detected activities from Step 3. Select emission factors for each activity.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select emission factors for each activity detected from your Step 3 data
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {activityData ? (
            <div className="space-y-4">
              {(() => {
                const activities = activityData[activeScope] || [];
                if (activities.length === 0) {
                  return (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No {activeScope.toUpperCase()} activities found from Step 3. Add activities in Step 3 to see them here.
                      </AlertDescription>
                    </Alert>
                  );
                }
                
                return activities.map((activity: any, index: number) => {
                  const currentFactor = getCurrentFactor(activity);
                  const applicableFactors = getApplicableFactors(activity);
                  const suggestedFactors = getSuggestedFactorsForActivity(activity);
                  
                  return (
                    <Card key={`${activeScope}-${index}`} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <Label className="text-muted-foreground">Activity</Label>
                              <p className="font-medium capitalize">{activity.source.replace('-', ' ')}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Amount</Label>
                              <p className="font-medium">{activity.amount} {activity.unit}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Facility</Label>
                              <p className="font-medium">{activity.facility || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="w-full max-w-md">
                            <Label className="text-muted-foreground text-sm mb-2 block">Emission Factor</Label>
                            <Select 
                              value={getCurrentFactorId(activity)} 
                              onValueChange={(value) => handleFactorSelection(activity, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select emission factor" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="custom">
                                  (Custom Input)
                                </SelectItem>
                                {/* Show all available factors for the current scope */}
                                {availableFactors.map((factor) => {
                                  // Check if this factor is a suggested match
                                  const suggestion = suggestedFactors.find(s => s.factor.id === factor.id);
                                  const indicator = suggestion ? 
                                    (suggestion.score === 100 ? '✓ ' : suggestion.score >= 70 ? '⚠ ' : '⚠ ') : '';
                                  
                                  return (
                                    <SelectItem key={factor.id} value={factor.id}>
                                      {indicator}{formatFactorName(factor)} - {formatFactorValue(factor)}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            
                            {/* Custom Factor Input */}
                            {(() => {
                              const activityKey = `${activity.amount}-${activity.unit}-${activity.source}`;
                              const customInput = customFactorInputs[activityKey];
                              
                              if (customInput) {
                                return (
                                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <Label className="text-sm font-medium text-yellow-800 mb-2 block">
                                      Custom Emission Factor
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs text-yellow-700">Factor Value</Label>
                                        <Input
                                          type="number"
                                          step="0.0001"
                                          placeholder="0.0000"
                                          value={customInput.value}
                                          onChange={(e) => handleCustomFactorChange(activity, 'value', e.target.value)}
                                          className="text-sm"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs text-yellow-700">Unit</Label>
                                        <Select
                                          value={customInput.unit}
                                          onValueChange={(value) => handleCustomFactorChange(activity, 'unit', value)}
                                        >
                                          <SelectTrigger className="text-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="tCO₂e/m³">tCO₂e/m³</SelectItem>
                                            <SelectItem value="tCO₂e/MWh">tCO₂e/MWh</SelectItem>
                                            <SelectItem value="kgCO₂e/liter">kgCO₂e/liter</SelectItem>
                                            <SelectItem value="kgCO₂e/km">kgCO₂e/km</SelectItem>
                                            <SelectItem value="tCO₂e/tonne">tCO₂e/tonne</SelectItem>
                                            <SelectItem value="kgCO₂e/m³">kgCO₂e/m³</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                      <p className="text-xs text-yellow-600">
                                        Estimated emissions: {customInput.value && !isNaN(parseFloat(customInput.value)) 
                                          ? (activity.amount * parseFloat(customInput.value)).toFixed(4) 
                                          : '0.0000'} tCO₂e
                                      </p>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setCustomFactorInputs(prev => {
                                              const newInputs = { ...prev };
                                              delete newInputs[activityKey];
                                              return newInputs;
                                            });
                                          }}
                                          className="text-xs"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleCustomFactorSubmit(activity)}
                                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                                        >
                                          Apply Factor
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            
                            {currentFactor && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-800">
                                    Selected: {formatFactorName(currentFactor.factor)} - {formatFactorValue(currentFactor.factor)}
                                  </span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                  Estimated emissions: {currentFactor.calculatedEmissions.toFixed(4)} tCO₂e
                                </p>
                              </div>
                            )}
                            
                            {applicableFactors.length === 0 && !currentFactor && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  No emission factors found for this activity type. You can add a custom factor.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                        
                        {currentFactor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveFactor(currentFactor.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                });
              })()}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No activity data found from Step 3. Complete Step 3 first to auto-detect activities.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Factor Library - Primary Entry */}
      <Card className="border-2 border-rectify-green">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsFactorLibraryExpanded(!isFactorLibraryExpanded)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Table className="h-5 w-5 text-rectify-green" />
              <span>UAE Emission Factor Library</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose from official UAE-certified emission factors for {activeScope.toUpperCase()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {isFactorLibraryExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </CardTitle>
          {!isFactorLibraryExpanded && (
            <p className="text-sm text-muted-foreground">
              Reference library of UAE-certified emission factors for {activeScope.toUpperCase()}. Click to expand.
            </p>
          )}
        </CardHeader>
        {isFactorLibraryExpanded && (
          <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search factors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Factor List - Reference Only */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredFactors.map((factor) => (
              <Card key={factor.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{formatFactorName(factor)}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Emission Factor</Label>
                      <p className="font-medium text-rectify-green text-lg">{formatFactorValue(factor)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Authority</Label>
                      <p className="font-medium">{factor.source}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Label className="text-muted-foreground text-xs">Applies To</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {factor.applies_to.map((applies, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {applies.source.replace('-', ' ')} ({applies.units.join(', ')})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {factor.notes && (
                    <div className="mt-2">
                      <Label className="text-muted-foreground text-xs">Notes</Label>
                      <p className="text-xs text-muted-foreground">{factor.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredFactors.length === 0 && (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                No factors found matching "{searchTerm}". Try a different search term or add a custom factor.
              </AlertDescription>
            </Alert>
          )}
          </CardContent>
        )}
      </Card>

      {/* UAE Compliance Information */}
      {isGuidelinesVisible && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center justify-between">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                UAE Emission Factor Guidelines
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsGuidelinesVisible(false)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• <strong>DEWA Grid Factor:</strong> 0.4772 tCO₂e/MWh (2024 certified factor)</p>
              <p>• <strong>ADNOC Petroleum Products:</strong> Latest emission factors for fossil fuels</p>
              <p>• <strong>UAE Ministry of Energy:</strong> Official natural gas and renewable factors</p>
              <p>• <strong>Transport Authority:</strong> Vehicle and public transport emission factors</p>
              <p>• <strong>Compliance:</strong> All factors comply with Federal Decree-Law No. (11) of 2024</p>
              <p>• <strong>Update Frequency:</strong> Factors are updated annually by respective authorities</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}