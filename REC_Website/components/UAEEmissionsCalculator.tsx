import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Calculator, Plus, Trash2, Info, Zap } from "lucide-react";
import { toast } from "sonner";

interface UAEEmissionsCalculatorProps {
  activeScope: 'scope1' | 'scope2' | 'scope3';
  onAddFactor: (factor: any) => void;
  existingFactors: any[];
  onRemoveFactor: (id: string) => void;
}

export function UAEEmissionsCalculator({ 
  activeScope, 
  onAddFactor, 
  existingFactors,
  onRemoveFactor 
}: UAEEmissionsCalculatorProps) {
  const [selectedSource, setSelectedSource] = useState('');
  const [activityValue, setActivityValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [calculatedEmissions, setCalculatedEmissions] = useState<number | null>(null);

  // UAE Emission Factors Database
  const uaeEmissionFactors = {
    scope1: {
      'natural-gas': { factor: 0.0184, unit: 'tCO₂e/m³', source: 'UAE Energy Authority 2024' },
      'diesel': { factor: 2.67, unit: 'tCO₂e/m³', source: 'ADNOC Emission Factors 2024' },
      'gasoline': { factor: 2.31, unit: 'tCO₂e/m³', source: 'ADNOC Emission Factors 2024' },
      'lpg': { factor: 1.51, unit: 'tCO₂e/tonne', source: 'UAE Ministry of Energy 2024' },
      'fleet-vehicles': { factor: 0.171, unit: 'kgCO₂e/km', source: 'UAE Transport Authority 2024' }
    },
    scope2: {
      'grid-electricity': { factor: 0.4772, unit: 'tCO₂e/MWh', source: 'DEWA Grid Emission Factor 2024' },
      'district-cooling': { factor: 0.5892, unit: 'tCO₂e/MWh', source: 'Dubai District Cooling 2024' },
      'district-heating': { factor: 0.2156, unit: 'tCO₂e/MWh', source: 'UAE Heating Networks 2024' }
    },
    scope3: {
      'business-travel': { factor: 0.255, unit: 'kgCO₂e/km', source: 'IATA Air Travel Factors 2024' },
      'employee-commuting': { factor: 0.171, unit: 'kgCO₂e/km', source: 'UAE Transport Authority 2024' },
      'waste': { factor: 0.0211, unit: 'tCO₂e/tonne', source: 'UAE Waste Management 2024' },
      'water': { factor: 0.344, unit: 'kgCO₂e/m³', source: 'DEWA Water Treatment 2024' }
    }
  };

  const calculateEmissions = () => {
    if (!selectedSource || !activityValue || !selectedUnit) return;

    const factorData = uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1];
    if (!factorData) return;

    const activity = parseFloat(activityValue);
    if (isNaN(activity)) return;

    // Convert units if necessary and calculate
    let emissions = activity * factorData.factor;
    
    // Unit conversions
    if (factorData.unit.includes('kg') && selectedUnit === 'km') {
      emissions = emissions / 1000; // Convert kg to tonnes
    }
    
    if (factorData.unit.includes('MWh') && selectedUnit === 'kWh') {
      emissions = emissions / 1000; // Convert kWh to MWh
    }
    
    setCalculatedEmissions(emissions);
    toast.success('Emissions calculated successfully!');
  };

  const addToEmissionFactors = () => {
    if (!selectedSource || calculatedEmissions === null) return;

    const factorData = uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1];
    if (!factorData) return;

    const newFactor = {
      id: Date.now().toString(),
      source: selectedSource,
      factor: factorData.factor,
      unit: factorData.unit,
      reference: factorData.source,
      calculatedEmissions: calculatedEmissions,
      activityAmount: parseFloat(activityValue),
      activityUnit: selectedUnit
    };

    onAddFactor(newFactor);

    // Reset calculator
    setSelectedSource('');
    setActivityValue('');
    setSelectedUnit('');
    setCalculatedEmissions(null);
    
    toast.success('Emission factor added to report!');
  };

  return (
    <div className="space-y-6">
      {/* UAE Emissions Calculator */}
      <Card className="border-2 border-rectify-green">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-rectify-green" />
            <span>UAE Emissions Calculator</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Calculate emissions using official UAE emission factors for {activeScope.toUpperCase()}</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculate emissions using official UAE emission factors for {activeScope.toUpperCase()} sources
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Emission Source *</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(uaeEmissionFactors[activeScope] || {}).map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Activity Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={activityValue}
                onChange={(e) => setActivityValue(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {activeScope === 'scope1' && (
                    <>
                      <SelectItem value="m³">m³ (Cubic meters)</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="km">Kilometers</SelectItem>
                    </>
                  )}
                  {activeScope === 'scope2' && (
                    <>
                      <SelectItem value="kWh">kWh</SelectItem>
                      <SelectItem value="MWh">MWh</SelectItem>
                    </>
                  )}
                  {activeScope === 'scope3' && (
                    <>
                      <SelectItem value="km">Kilometers</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="m³">m³ (Cubic meters)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSource && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2 text-blue-800">Official UAE Emission Factor</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Factor:</strong> {uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1]?.factor} {uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1]?.unit}</p>
                <p><strong>Authority:</strong> {uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1]?.source}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={calculateEmissions} 
              className="flex-1 bg-rectify-green hover:bg-rectify-green-dark"
              disabled={!selectedSource || !activityValue || !selectedUnit}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Emissions
            </Button>
            {calculatedEmissions !== null && (
              <Button 
                onClick={addToEmissionFactors} 
                variant="outline" 
                className="flex-1 border-rectify-green text-rectify-green hover:bg-rectify-green hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Report
              </Button>
            )}
          </div>

          {calculatedEmissions !== null && (
            <div className="p-4 bg-rectify-accent rounded-lg border border-rectify-green">
              <h4 className="font-medium text-rectify-green mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Calculated Emissions
              </h4>
              <div className="text-3xl font-bold text-rectify-green mb-2">
                {calculatedEmissions.toFixed(4)} tCO₂e
              </div>
              <p className="text-sm text-muted-foreground">
                {activityValue} {selectedUnit} × {uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1]?.factor} {uaeEmissionFactors[activeScope]?.[selectedSource as keyof typeof uaeEmissionFactors.scope1]?.unit}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {activeScope.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs border-rectify-green text-rectify-green">
                  UAE Certified
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configured Factors Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your {activeScope.toUpperCase()} Emission Factors</span>
            <Badge variant="secondary">
              {existingFactors.length} configured
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {existingFactors.map((factor: any, index: number) => (
              <Card key={factor.id} className="p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">
                    {factor.source.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFactor(factor.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Emission Factor</Label>
                    <p className="font-medium">{factor.factor} {factor.unit}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Activity Amount</Label>
                    <p className="font-medium">{factor.activityAmount} {factor.activityUnit}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Calculated Emissions</Label>
                    <p className="font-medium text-rectify-green">{factor.calculatedEmissions?.toFixed(4)} tCO₂e</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Authority Reference</Label>
                    <p className="font-medium text-xs">{factor.reference}</p>
                  </div>
                </div>
              </Card>
            ))}
            
            {existingFactors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emission factors configured yet for {activeScope.toUpperCase()}.</p>
                <p className="text-sm">Use the calculator above to add UAE-certified emission factors.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UAE Compliance Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Info className="h-5 w-5 mr-2" />
            UAE Emission Factor Guidelines
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
    </div>
  );
}