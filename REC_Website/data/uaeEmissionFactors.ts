export const uaeEmissionFactors = {
  "factors": [
    {
      "id": "dewa-grid-2024",
      "scope": "scope2",
      "name": "DEWA Grid Electricity (2024)",
      "year": "2024",
      "factor_value": 0.4772,
      "unit": "tCO₂e/MWh",
      "applies_to": [
        {
          "source": "grid-electricity",
          "units": ["kWh", "MWh"]
        }
      ],
      "source": "DEWA Grid Emission Factor 2024",
      "notes": "Official Dubai Electricity and Water Authority grid emission factor",
      "certified": true
    },
    {
      "id": "adnoc-diesel-2024",
      "scope": "scope1",
      "name": "ADNOC Diesel (2024)",
      "year": "2024",
      "factor_value": 2.68,
      "unit": "kgCO₂e/liter",
      "applies_to": [
        {
          "source": "diesel",
          "units": ["liters", "m³"]
        }
      ],
      "source": "ADNOC Emission Factors 2024",
      "notes": "ADNOC petroleum products emission factor for diesel",
      "certified": true
    },
    {
      "id": "adnoc-petrol-2024",
      "scope": "scope1",
      "name": "ADNOC Petrol (2024)",
      "year": "2024",
      "factor_value": 2.31,
      "unit": "kgCO₂e/liter",
      "applies_to": [
        {
          "source": "gasoline",
          "units": ["liters", "m³"]
        }
      ],
      "source": "ADNOC Emission Factors 2024",
      "notes": "ADNOC petroleum products emission factor for gasoline",
      "certified": true
    },
    {
      "id": "uae-natural-gas-2024",
      "scope": "scope1",
      "name": "UAE Natural Gas (2024)",
      "year": "2024",
      "factor_value": 0.0184,
      "unit": "tCO₂e/m³",
      "applies_to": [
        {
          "source": "natural-gas",
          "units": ["m³", "cubic-meters"]
        }
      ],
      "source": "UAE Energy Authority 2024",
      "notes": "Official UAE natural gas combustion emission factor",
      "certified": true
    },
    {
      "id": "uae-lpg-2024",
      "scope": "scope1",
      "name": "UAE LPG (2024)",
      "year": "2024",
      "factor_value": 1.51,
      "unit": "tCO₂e/tonne",
      "applies_to": [
        {
          "source": "lpg",
          "units": ["tonnes", "kg"]
        }
      ],
      "source": "UAE Ministry of Energy 2024",
      "notes": "Liquefied petroleum gas emission factor",
      "certified": true
    },
    {
      "id": "uae-fleet-vehicles-2024",
      "scope": "scope1",
      "name": "UAE Fleet Vehicles (2024)",
      "year": "2024",
      "factor_value": 0.171,
      "unit": "kgCO₂e/km",
      "applies_to": [
        {
          "source": "fleet-vehicles",
          "units": ["km", "kilometers"]
        }
      ],
      "source": "UAE Transport Authority 2024",
      "notes": "Corporate fleet vehicle emission factor",
      "certified": true
    },
    {
      "id": "dubai-district-cooling-2024",
      "scope": "scope2",
      "name": "Dubai District Cooling (2024)",
      "year": "2024",
      "factor_value": 0.5892,
      "unit": "tCO₂e/MWh",
      "applies_to": [
        {
          "source": "district-cooling",
          "units": ["kWh", "MWh"]
        }
      ],
      "source": "Dubai District Cooling 2024",
      "notes": "District cooling system emission factor",
      "certified": true
    },
    {
      "id": "uae-district-heating-2024",
      "scope": "scope2",
      "name": "UAE District Heating (2024)",
      "year": "2024",
      "factor_value": 0.2156,
      "unit": "tCO₂e/MWh",
      "applies_to": [
        {
          "source": "district-heating",
          "units": ["kWh", "MWh"]
        }
      ],
      "source": "UAE Heating Networks 2024",
      "notes": "District heating system emission factor",
      "certified": true
    },
    {
      "id": "iata-business-travel-2024",
      "scope": "scope3",
      "name": "IATA Business Travel (2024)",
      "year": "2024",
      "factor_value": 0.255,
      "unit": "kgCO₂e/km",
      "applies_to": [
        {
          "source": "business-travel",
          "units": ["km", "kilometers"]
        }
      ],
      "source": "IATA Air Travel Factors 2024",
      "notes": "International air travel emission factor",
      "certified": true
    },
    {
      "id": "uae-employee-commuting-2024",
      "scope": "scope3",
      "name": "UAE Employee Commuting (2024)",
      "year": "2024",
      "factor_value": 0.171,
      "unit": "kgCO₂e/km",
      "applies_to": [
        {
          "source": "employee-commuting",
          "units": ["km", "kilometers"]
        }
      ],
      "source": "UAE Transport Authority 2024",
      "notes": "Employee commuting emission factor",
      "certified": true
    },
    {
      "id": "uae-waste-management-2024",
      "scope": "scope3",
      "name": "UAE Waste Management (2024)",
      "year": "2024",
      "factor_value": 0.0211,
      "unit": "tCO₂e/tonne",
      "applies_to": [
        {
          "source": "waste",
          "units": ["tonnes", "kg"]
        }
      ],
      "source": "UAE Waste Management 2024",
      "notes": "Waste disposal and treatment emission factor",
      "certified": true
    },
    {
      "id": "dewa-water-treatment-2024",
      "scope": "scope3",
      "name": "DEWA Water Treatment (2024)",
      "year": "2024",
      "factor_value": 0.344,
      "unit": "kgCO₂e/m³",
      "applies_to": [
        {
          "source": "water",
          "units": ["m³", "cubic-meters", "liters"]
        }
      ],
      "source": "DEWA Water Treatment 2024",
      "notes": "Water treatment and distribution emission factor",
      "certified": true
    }
  ]
};
