import { uaeEmissionFactors } from '../data/uaeEmissionFactors';

export interface EmissionFactor {
  id: string;
  scope: 'scope1' | 'scope2' | 'scope3';
  name: string;
  year: string;
  factor_value: number;
  unit: string;
  applies_to: Array<{
    source: string;
    units: string[];
  }>;
  source: string;
  notes: string;
  certified: boolean;
}

export interface AppliedFactor {
  id: string;
  factor: EmissionFactor;
  activityAmount: number;
  activityUnit: string;
  calculatedEmissions: number;
  appliedAt: string;
}

// Load factors from JSON
export const getUAEFactors = (): EmissionFactor[] => {
  return uaeEmissionFactors.factors as EmissionFactor[];
};

// Get factors by scope
export const getFactorsByScope = (scope: 'scope1' | 'scope2' | 'scope3'): EmissionFactor[] => {
  return getUAEFactors().filter(factor => factor.scope === scope);
};

// Convert units for calculation
export const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
  const conversions: Record<string, Record<string, number>> = {
    'kWh': { 'MWh': 0.001 },
    'MWh': { 'kWh': 1000 },
    'liters': { 'm³': 0.001 },
    'm³': { 'liters': 1000, 'cubic-meters': 1 },
    'kg': { 'tonnes': 0.001 },
    'tonnes': { 'kg': 1000 },
    'km': { 'kilometers': 1 },
    'kilometers': { 'km': 1 },
    'cubic-meters': { 'm³': 1 }
  };

  if (fromUnit === toUnit) return value;
  if (conversions[fromUnit]?.[toUnit]) {
    return value * conversions[fromUnit][toUnit];
  }
  return value; // No conversion available
};

// Calculate emissions using factor
export const calculateEmissions = (
  activityAmount: number,
  activityUnit: string,
  factor: EmissionFactor
): number => {
  // Convert activity amount to factor's expected unit
  const factorUnit = factor.unit.split('/')[1]; // Extract unit from "tCO₂e/MWh"
  const convertedAmount = convertUnit(activityAmount, activityUnit, factorUnit);
  
  // Calculate emissions
  const emissions = convertedAmount * factor.factor_value;
  
  // Convert result to tonnes CO₂e if needed
  if (factor.unit.includes('kgCO₂e')) {
    return emissions / 1000; // Convert kg to tonnes
  }
  
  return emissions;
};

// Check if factor applies to activity
export const factorAppliesToActivity = (
  factor: EmissionFactor,
  activitySource: string,
  activityUnit: string
): boolean => {
  return factor.applies_to.some(appliesTo => {
    // Direct match
    if (appliesTo.source === activitySource && appliesTo.units.includes(activityUnit)) {
      return true;
    }
    
    // Handle common variations and synonyms
    const sourceVariations: Record<string, string[]> = {
      'natural-gas': ['natural-gas', 'natural gas', 'gas', 'ng'],
      'grid-electricity': ['grid-electricity', 'grid electricity', 'electricity', 'power'],
      'diesel': ['diesel', 'diesel fuel', 'fuel'],
      'gasoline': ['gasoline', 'petrol', 'gas'],
      'business-travel': ['business-travel', 'business travel', 'travel', 'flights'],
      'employee-commuting': ['employee-commuting', 'employee commuting', 'commuting'],
      'waste': ['waste', 'waste disposal', 'garbage'],
      'water': ['water', 'water consumption', 'water usage'],
      'district-cooling': ['district-cooling', 'district cooling', 'cooling'],
      'district-heating': ['district-heating', 'district heating', 'heating'],
      'fleet-vehicles': ['fleet-vehicles', 'fleet vehicles', 'vehicles', 'company cars'],
      'lpg': ['lpg', 'liquefied petroleum gas', 'propane']
    };
    
    const unitVariations: Record<string, string[]> = {
      'm³': ['m³', 'cubic-meters', 'cubic meters', 'm3'],
      'kWh': ['kWh', 'kwh', 'kilowatt-hours'],
      'MWh': ['MWh', 'mwh', 'megawatt-hours'],
      'liters': ['liters', 'litres', 'l'],
      'tonnes': ['tonnes', 'tons', 't'],
      'kg': ['kg', 'kilograms', 'kilos'],
      'km': ['km', 'kilometers', 'kilometres']
    };
    
    // Check if activity source matches any variation of the factor's source
    const sourceMatches = sourceVariations[appliesTo.source]?.includes(activitySource) ||
                         sourceVariations[activitySource]?.includes(appliesTo.source) ||
                         appliesTo.source === activitySource;
    
    // Check if activity unit matches any variation of the factor's units
    const unitMatches = appliesTo.units.some(unit => {
      const unitVariationsList = unitVariations[unit] || [unit];
      const activityUnitVariations = unitVariations[activityUnit] || [activityUnit];
      return unitVariationsList.some(variation => activityUnitVariations.includes(variation));
    });
    
    return sourceMatches && unitMatches;
  });
};

// Get matching activities for a factor
export const getMatchingActivities = (
  factor: EmissionFactor,
  activityData: any
): any[] => {
  const matchingActivities: any[] = [];
  
  // Check all scopes for matching activities
  ['scope1', 'scope2', 'scope3'].forEach(scope => {
    const activities = activityData[scope] || [];
    activities.forEach((activity: any) => {
      if (factorAppliesToActivity(factor, activity.source, activity.unit)) {
        matchingActivities.push({
          ...activity,
          scope,
          calculatedEmissions: calculateEmissions(
            activity.amount,
            activity.unit,
            factor
          )
        });
      }
    });
  });
  
  return matchingActivities;
};

// Format factor name for display
export const formatFactorName = (factor: EmissionFactor): string => {
  // Remove duplicate year if it's already in the name
  const nameWithoutYear = factor.name.replace(/\s*\(\d{4}\)\s*$/, '');
  return `${nameWithoutYear} (${factor.year})`;
};

// Format factor value for display
export const formatFactorValue = (factor: EmissionFactor): string => {
  return `${factor.factor_value} ${factor.unit}`;
};

// Get suggested factors for an activity (with scoring)
export const getSuggestedFactors = (
  activitySource: string,
  activityUnit: string,
  scope: 'scope1' | 'scope2' | 'scope3'
): Array<{ factor: EmissionFactor; score: number; reason: string }> => {
  const allFactors = getFactorsByScope(scope);
  const suggestions: Array<{ factor: EmissionFactor; score: number; reason: string }> = [];
  
  allFactors.forEach(factor => {
    let score = 0;
    let reason = '';
    
    // Check direct applicability
    if (factorAppliesToActivity(factor, activitySource, activityUnit)) {
      score = 100;
      reason = 'Perfect match for activity type and unit';
    } else {
      // Check partial matches
      const sourceMatches = factor.applies_to.some(appliesTo => 
        appliesTo.source === activitySource
      );
      const unitMatches = factor.applies_to.some(appliesTo => 
        appliesTo.units.includes(activityUnit)
      );
      
      if (sourceMatches && !unitMatches) {
        score = 70;
        reason = 'Matches activity type but different unit (conversion may be needed)';
      } else if (!sourceMatches && unitMatches) {
        score = 50;
        reason = 'Matches unit but different activity type';
      } else {
        // Check for similar activities
        const similarSources = ['natural-gas', 'gasoline', 'diesel'].includes(activitySource) && 
                              ['natural-gas', 'gasoline', 'diesel'].includes(factor.applies_to[0]?.source || '');
        if (similarSources) {
          score = 30;
          reason = 'Similar fuel type (may require manual verification)';
        }
      }
    }
    
    if (score > 0) {
      suggestions.push({ factor, score, reason });
    }
  });
  
  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
};

// Validate factor selection
export const validateFactorSelection = (
  factor: EmissionFactor,
  activitySource: string,
  activityUnit: string
): { isValid: boolean; warnings: string[]; errors: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check if factor applies to activity
  if (!factorAppliesToActivity(factor, activitySource, activityUnit)) {
    warnings.push(`Factor "${factor.name}" may not be ideal for activity "${activitySource}" with unit "${activityUnit}"`);
  }
  
  // Check for unit conversion needs
  const factorUnit = factor.unit.split('/')[1];
  if (activityUnit !== factorUnit && !convertUnit(1, activityUnit, factorUnit)) {
    warnings.push(`Unit conversion from "${activityUnit}" to "${factorUnit}" may not be accurate`);
  }
  
  // Check certification status
  if (!factor.certified) {
    warnings.push('This factor is not certified and may not be suitable for official reporting');
  }
  
  return {
    isValid: true, // Always allow selection, just show warnings
    warnings,
    errors
  };
};
