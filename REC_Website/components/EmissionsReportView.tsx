import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { EmissionsReportData } from "./EmissionsReport";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText,
  Building2,
  Calendar,
  Globe,
  BarChart3,
  TrendingDown,
  Shield,
  CheckCircle,
  Paperclip
} from "lucide-react";

interface EmissionsReportViewProps {
  reportData: EmissionsReportData;
  onBackToWizard: () => void;
}

export function EmissionsReportView({ reportData, onBackToWizard }: EmissionsReportViewProps) {
  const [isPrintMode, setIsPrintMode] = useState(false);

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  const handleExportPDF = () => {
    // Create a printable version with RECtify and company branding
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate company logo based on company name
    const companyInitial = reportData.company.name ? reportData.company.name.charAt(0).toUpperCase() : 'C';

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>UAE Emissions Report - ${reportData.company.name}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              min-height: 100vh;
              page-break-after: always;
              padding: 0;
              margin: 0;
            }
            .page:last-child {
              page-break-after: avoid;
            }
            .page-break {
              page-break-before: always;
            }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
            h2 { font-size: 20px; font-weight: bold; margin-bottom: 12px; margin-top: 24px; }
            h3 { font-size: 16px; font-weight: bold; margin-bottom: 8px; margin-top: 16px; }
            h4 { font-size: 14px; font-weight: bold; margin-bottom: 6px; margin-top: 12px; }
            p { margin-bottom: 8px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 12px 0; 
              page-break-inside: avoid;
            }
            th, td { 
              border: 1px solid #ccc; 
              padding: 6px; 
              font-size: 10px; 
              text-align: left;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .text-center { text-align: center; }
            .header-branding {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 2px solid #16a085;
            }
            .rectify-logo {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              text-align: right;
            }
            .rectify-text {
              font-size: 16px;
              font-weight: bold;
              background: linear-gradient(135deg, #16a085 0%, #3b82f6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 4px;
            }
            .rectify-arabic {
              font-size: 14px;
              color: #16a085;
              direction: rtl;
            }
            .rectify-tagline {
              font-size: 8px;
              color: #666;
              margin-top: 2px;
            }
            .company-logo {
              width: 100px;
              height: 100px;
              margin: 0 auto 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, #16a085 0%, #3b82f6 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 28px;
              border: 3px solid #16a085;
              box-shadow: 0 4px 15px rgba(22, 160, 133, 0.3);
            }
            .metrics-card {
              border: 1px solid #e5e5e5;
              border-radius: 4px;
              padding: 12px;
              margin: 8px;
              text-align: center;
              display: inline-block;
              width: 200px;
            }
            .metrics-value {
              font-size: 24px;
              font-weight: bold;
              color: #16a085;
            }
            .bg-gray-50 { background-color: #f9f9f9; }
            .space-y-4 > * + * { margin-top: 12px; }
            .space-y-6 > * + * { margin-top: 16px; }
            .grid-3 { display: flex; justify-content: space-around; flex-wrap: wrap; }
          </style>
        </head>
        <body>
          <!-- Front Page -->
          <div class="page text-center" style="padding-top: 60px;">
            <!-- RECtify Header Branding -->
            <div class="header-branding">
              <div></div>
              <div class="rectify-logo">
                <div class="rectify-text">RECtify</div>
                <div class="rectify-arabic">ريكتيفاي</div>
                <div class="rectify-tagline">UAE's First Digital I-REC Trading Platform</div>
              </div>
            </div>
            
            <div class="company-logo">
              ${companyInitial}
            </div>
            
            <h1>GREENHOUSE GAS EMISSIONS REPORT</h1>
            <h2 style="color: #666; margin-bottom: 20px;">Federal Decree-Law No. (11) of 2024</h2>
            <h3 style="color: #666; margin-bottom: 40px;">Cabinet Resolution No. (67) of 2024</h3>
            
            <div style="margin-top: 60px;">
              <h3>${reportData.company.name}</h3>
              <p style="margin-bottom: 20px;">Trade License: ${reportData.company.tradeLicense}</p>
              
              <p><strong>Reporting Year:</strong> ${reportData.company.reportingYear}</p>
              <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-AE')}</p>
              
              <div style="margin-top: 40px; padding: 20px; background: #f0f9ff; border-radius: 8px; display: inline-block;">
                <h4>Total Emissions</h4>
                <div class="metrics-value" style="font-size: 36px; color: #16a085;">
                  ${reportData.calculations.totalEmissions.toLocaleString()} tCO₂e
                </div>
              </div>
            </div>
          </div>

          <!-- Executive Summary -->
          <div class="page page-break">
            <h2>Executive Summary</h2>
            <p style="font-size: 12px; margin-bottom: 20px;">
              This report presents the greenhouse gas emissions inventory for <strong>${reportData.company.name}</strong> 
              for the calendar year ${reportData.company.reportingYear}, prepared in compliance with Federal Decree-Law 
              No. (11) of 2024 on Climate Change and Cabinet Resolution No. (67) of 2024.
            </p>
            
            <div class="grid-3">
              <div class="metrics-card">
                <div class="metrics-value" style="color: #3b82f6;">${reportData.calculations.scope1Total.toLocaleString()}</div>
                <div>Scope 1 (tCO₂e)</div>
                <div style="font-size: 9px; color: #666;">Direct Emissions</div>
              </div>
              
              <div class="metrics-card">
                <div class="metrics-value" style="color: #10b981;">${reportData.calculations.scope2Total.toLocaleString()}</div>
                <div>Scope 2 (tCO₂e)</div>
                <div style="font-size: 9px; color: #666;">Energy Indirect</div>
              </div>
              
              <div class="metrics-card">
                <div class="metrics-value" style="color: #f59e0b;">${reportData.calculations.scope3Total.toLocaleString()}</div>
                <div>Scope 3 (tCO₂e)</div>
                <div style="font-size: 9px; color: #666;">Other Indirect</div>
              </div>
            </div>

            <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 20px;">
              <h4>Key Findings</h4>
              <ul style="margin-left: 20px;">
                <li>Total greenhouse gas emissions: <strong>${reportData.calculations.totalEmissions.toLocaleString()} tCO₂e</strong></li>
                <li>Scope 2 emissions represent the largest contribution (${((reportData.calculations.scope2Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}% of total)</li>
                <li>${reportData.reportingScope.facilities.length} facilities included in the reporting boundary</li>
                <li>Emissions reported across ${reportData.reportingScope.operationalBoundary.length} scope categories</li>
              </ul>
            </div>
          </div>

          <!-- Company Information -->
          <div class="page page-break">
            <h2>Company Information</h2>
            
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                <h3>Organization Details</h3>
                <p><strong>Company Name:</strong> ${reportData.company.name}</p>
                <p><strong>Trade License:</strong> ${reportData.company.tradeLicense}</p>
                <p><strong>Business Sector:</strong> ${reportData.company.sector}</p>
                <p><strong>Number of Employees:</strong> ${reportData.company.employees.toLocaleString()}</p>
              </div>
              
              <div style="width: 48%;">
                <h3>Contact Information</h3>
                <p><strong>Address:</strong> ${reportData.company.address}</p>
                <p><strong>Contact Person:</strong> ${reportData.company.contactPerson}</p>
                <p><strong>Email:</strong> ${reportData.company.email}</p>
                <p><strong>Phone:</strong> ${reportData.company.phone}</p>
              </div>
            </div>
          </div>

          <!-- Emission Calculations -->
          <div class="page page-break">
            <h2>Emission Calculations and Results</h2>
            
            <h3>Emissions Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Emissions (tCO₂e)</th>
                  <th>Percentage (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Scope 1 - Direct</td>
                  <td style="text-align: right;">${reportData.calculations.scope1Total.toLocaleString()}</td>
                  <td style="text-align: right;">${((reportData.calculations.scope1Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Scope 2 - Energy Indirect</td>
                  <td style="text-align: right;">${reportData.calculations.scope2Total.toLocaleString()}</td>
                  <td style="text-align: right;">${((reportData.calculations.scope2Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Scope 3 - Other Indirect</td>
                  <td style="text-align: right;">${reportData.calculations.scope3Total.toLocaleString()}</td>
                  <td style="text-align: right;">${((reportData.calculations.scope3Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}%</td>
                </tr>
                <tr style="background: #f5f5f5; font-weight: bold;">
                  <td>Total Emissions</td>
                  <td style="text-align: right;">${reportData.calculations.totalEmissions.toLocaleString()}</td>
                  <td style="text-align: right;">100.0%</td>
                </tr>
              </tbody>
            </table>

            <h3>Emissions by Facility</h3>
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Scope 1 (tCO₂e)</th>
                  <th>Scope 2 (tCO₂e)</th>
                  <th>Total (tCO₂e)</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.calculations.emissionsByFacility.map(facility => `
                  <tr>
                    <td>${facility.facility}</td>
                    <td style="text-align: right;">${facility.scope1.toLocaleString()}</td>
                    <td style="text-align: right;">${facility.scope2.toLocaleString()}</td>
                    <td style="text-align: right;"><strong>${facility.total.toLocaleString()}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Management Declarations -->
          <div class="page page-break">
            <h2>Management Declarations</h2>
            
            <h3>Declaration of Accuracy and Completeness</h3>
            <p>✓ I declare that the information contained in this emissions report is accurate and complete to the best of my knowledge and belief.</p>
            <p>✓ I confirm that all material emission sources have been identified and included in accordance with the reporting requirements.</p>
            <p>✓ I acknowledge that this report has been prepared in compliance with Federal Decree-Law No. (11) of 2024 and Cabinet Resolution No. (67) of 2024.</p>
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
              <div>
                <h4>Authorized Signatory</h4>
                <p><strong>Name:</strong> ${reportData.declarations.authorizedSignatory}</p>
                <p><strong>Position:</strong> ${reportData.declarations.position}</p>
                <p><strong>Date:</strong> ${reportData.declarations.date}</p>
                
                <div style="margin-top: 40px; border-bottom: 1px solid #ccc; width: 200px; height: 60px;">
                  <p style="margin-top: 65px; font-size: 10px; color: #666;">Signature</p>
                </div>
              </div>
              
              <div>
                <h4>Company Seal</h4>
                <div style="width: 100px; height: 100px; border: 2px solid #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">
                  Company Seal
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    // Wait for the document to load, then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const currentDate = new Date().toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Action Bar - Hidden in print */}
      <div className="print:hidden flex items-center justify-between">
        <Button variant="outline" onClick={onBackToWizard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Wizard
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button onClick={handleExportPDF} className="bg-rectify-green hover:bg-rectify-green-dark">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Container */}
      <div className={`report-container ${isPrintMode ? 'print-mode' : ''}`}>
        
        {/* Front Page */}
        <div className="report-page">
          <div className="text-center space-y-8 pt-12">
            {/* RECtify Header Branding */}
            <div className="flex justify-between items-center mb-12 pb-6 border-b-2 border-rectify-green">
              <div></div>
              <div className="text-right">
                <div className="text-2xl font-bold text-rectify-gradient mb-1">RECtify</div>
                <div className="text-lg text-rectify-green" style={{ direction: 'rtl' }}>ريكتيفاي</div>
                <div className="text-xs text-muted-foreground mt-1">UAE's First Digital I-REC Trading Platform</div>
              </div>
            </div>
            
            {/* Company Logo Area */}
            <div className="mx-auto w-32 h-32 bg-rectify-gradient rounded-full flex items-center justify-center border-4 border-rectify-green shadow-lg">
              <span className="text-white font-bold text-3xl">
                {reportData.company.name ? reportData.company.name.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">GREENHOUSE GAS EMISSIONS REPORT</h1>
              <h2 className="text-2xl text-muted-foreground">
                Federal Decree-Law No. (11) of 2024
              </h2>
              <h3 className="text-xl">
                Cabinet Resolution No. (67) of 2024
              </h3>
            </div>

            <div className="space-y-6 mt-16">
              <div className="space-y-2">
                <h3 className="text-2xl font-medium">{reportData.company.name}</h3>
                <p className="text-lg text-muted-foreground">
                  Trade License: {reportData.company.tradeLicense}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-lg">
                  <strong>Reporting Year:</strong> {reportData.company.reportingYear}
                </p>
                <p className="text-lg">
                  <strong>Report Generated:</strong> {currentDate}
                </p>
              </div>

              <div className="mt-16 p-6 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-lg mb-2">Total Emissions</h4>
                <div className="text-4xl font-bold text-blue-600">
                  {reportData.calculations.totalEmissions.toLocaleString()} tCO₂e
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">Table of Contents</h2>
          <div className="space-y-4">
            {[
              { section: "1. Executive Summary", page: 3 },
              { section: "2. Company Information", page: 4 },
              { section: "3. Reporting Scope and Methodology", page: 5 },
              { section: "4. Emission Sources and Activity Data", page: 6 },
              { section: "5. Emission Calculations and Results", page: 8 },
              { section: "6. Reduction Measures and Credits", page: 10 },
              { section: "7. Verification Statement", page: 11 },
              { section: "8. Management Declarations", page: 12 },
              { section: "9. Annexes and Supporting Documents", page: 13 }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-dotted pb-2">
                <span className="font-medium">{item.section}</span>
                <span>{item.page}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">1. Executive Summary</h2>
          
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              This report presents the greenhouse gas emissions inventory for <strong>{reportData.company.name}</strong> 
              for the calendar year {reportData.company.reportingYear}, prepared in compliance with Federal Decree-Law 
              No. (11) of 2024 on Climate Change and Cabinet Resolution No. (67) of 2024.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {reportData.calculations.scope1Total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Scope 1 (tCO₂e)</div>
                <div className="text-xs text-muted-foreground">Direct Emissions</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {reportData.calculations.scope2Total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Scope 2 (tCO₂e)</div>
                <div className="text-xs text-muted-foreground">Energy Indirect</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {reportData.calculations.scope3Total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Scope 3 (tCO₂e)</div>
                <div className="text-xs text-muted-foreground">Other Indirect</div>
              </Card>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-bold text-xl mb-4">Key Findings</h4>
              <ul className="space-y-2">
                <li>• Total greenhouse gas emissions: <strong>{reportData.calculations.totalEmissions.toLocaleString()} tCO₂e</strong></li>
                <li>• Scope 2 emissions represent the largest contribution ({((reportData.calculations.scope2Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}% of total)</li>
                <li>• {reportData.reportingScope.facilities.length} facilities included in the reporting boundary</li>
                <li>• Emissions reported across {reportData.reportingScope.operationalBoundary.length} scope categories</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">2. Company Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Organization Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Company Name:</span>
                  <p>{reportData.company.name}</p>
                </div>
                <div>
                  <span className="font-medium">Trade License:</span>
                  <p>{reportData.company.tradeLicense}</p>
                </div>
                <div>
                  <span className="font-medium">Business Sector:</span>
                  <p>{reportData.company.sector}</p>
                </div>
                <div>
                  <span className="font-medium">Number of Employees:</span>
                  <p>{reportData.company.employees.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Address:</span>
                  <p>{reportData.company.address}</p>
                </div>
                <div>
                  <span className="font-medium">Contact Person:</span>
                  <p>{reportData.company.contactPerson}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{reportData.company.email}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p>{reportData.company.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reporting Scope */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">3. Reporting Scope and Methodology</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Organizational Boundary</h3>
              <p className="mb-4">
                The organizational boundary for this report follows the <strong>{reportData.reportingScope.organizationalBoundary}</strong> approach, 
                in accordance with UAE greenhouse gas accounting guidelines.
              </p>
              
              <h4 className="font-medium mb-3">Facilities Included:</h4>
              <div className="space-y-3">
                {reportData.reportingScope.facilities.map((facility, index) => (
                  <Card key={facility.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{facility.name}</h5>
                        <p className="text-sm text-muted-foreground">{facility.address}</p>
                        <p className="text-sm">Type: {facility.type}</p>
                      </div>
                      <Badge variant="outline">{facility.ownership}% ownership</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Operational Boundary</h3>
              <p className="mb-4">
                The operational boundary includes the following emission scopes:
              </p>
              <ul className="space-y-2">
                {reportData.reportingScope.operationalBoundary.map((scope) => (
                  <li key={scope} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="capitalize">{scope.replace(/(\d)/, ' $1')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Emission Sources */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">4. Emission Sources and Activity Data</h2>
          
          <div className="space-y-8">
            {reportData.reportingScope.operationalBoundary.includes('scope1') && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Scope 1 - Direct Emissions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Source</th>
                        <th className="border border-gray-300 p-3 text-left">Activity</th>
                        <th className="border border-gray-300 p-3 text-right">Amount</th>
                        <th className="border border-gray-300 p-3 text-left">Unit</th>
                        <th className="border border-gray-300 p-3 text-left">Facility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.activityData.scope1.map((activity, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">{activity.source}</td>
                          <td className="border border-gray-300 p-3">{activity.activity}</td>
                          <td className="border border-gray-300 p-3 text-right">{activity.amount.toLocaleString()}</td>
                          <td className="border border-gray-300 p-3">{activity.unit}</td>
                          <td className="border border-gray-300 p-3">{activity.facility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportData.reportingScope.operationalBoundary.includes('scope2') && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Scope 2 - Energy Indirect Emissions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Source</th>
                        <th className="border border-gray-300 p-3 text-right">Amount</th>
                        <th className="border border-gray-300 p-3 text-left">Unit</th>
                        <th className="border border-gray-300 p-3 text-left">Facility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.activityData.scope2.map((activity, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">{activity.source}</td>
                          <td className="border border-gray-300 p-3 text-right">{activity.amount.toLocaleString()}</td>
                          <td className="border border-gray-300 p-3">{activity.unit}</td>
                          <td className="border border-gray-300 p-3">{activity.facility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calculations and Results */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">5. Emission Calculations and Results</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Emissions Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Scope</th>
                      <th className="border border-gray-300 p-3 text-right">Emissions (tCO₂e)</th>
                      <th className="border border-gray-300 p-3 text-right">Percentage (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Scope 1 - Direct</td>
                      <td className="border border-gray-300 p-3 text-right">{reportData.calculations.scope1Total.toLocaleString()}</td>
                      <td className="border border-gray-300 p-3 text-right">
                        {((reportData.calculations.scope1Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Scope 2 - Energy Indirect</td>
                      <td className="border border-gray-300 p-3 text-right">{reportData.calculations.scope2Total.toLocaleString()}</td>
                      <td className="border border-gray-300 p-3 text-right">
                        {((reportData.calculations.scope2Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Scope 3 - Other Indirect</td>
                      <td className="border border-gray-300 p-3 text-right">{reportData.calculations.scope3Total.toLocaleString()}</td>
                      <td className="border border-gray-300 p-3 text-right">
                        {((reportData.calculations.scope3Total / reportData.calculations.totalEmissions) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                      <td className="border border-gray-300 p-3">Total Emissions</td>
                      <td className="border border-gray-300 p-3 text-right">{reportData.calculations.totalEmissions.toLocaleString()}</td>
                      <td className="border border-gray-300 p-3 text-right">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Emissions by Facility</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Facility</th>
                      <th className="border border-gray-300 p-3 text-right">Scope 1 (tCO₂e)</th>
                      <th className="border border-gray-300 p-3 text-right">Scope 2 (tCO₂e)</th>
                      <th className="border border-gray-300 p-3 text-right">Total (tCO₂e)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.calculations.emissionsByFacility.map((facility, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3 font-medium">{facility.facility}</td>
                        <td className="border border-gray-300 p-3 text-right">{facility.scope1.toLocaleString()}</td>
                        <td className="border border-gray-300 p-3 text-right">{facility.scope2.toLocaleString()}</td>
                        <td className="border border-gray-300 p-3 text-right font-medium">{facility.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Statement */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">6. Verification Statement</h2>
          
          <div className="space-y-6">
            {reportData.verification.verificationRequired ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Third-Party Verified</h3>
                  </div>
                  <div className="space-y-3">
                    <p><strong>Verification Body:</strong> {reportData.verification.verifierName}</p>
                    <p><strong>Accreditation:</strong> {reportData.verification.verifierAccreditation}</p>
                    <p><strong>Verification Date:</strong> {reportData.verification.verificationDate}</p>
                  </div>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="font-semibold mb-2">Verification Statement</h4>
                  <p className="text-sm leading-relaxed">
                    {reportData.verification.verificationStatement || 
                    "We have verified the greenhouse gas assertions of [Company Name] for the year [Year] in accordance with ISO 14064-3:2019 and the requirements set forth in Cabinet Resolution No. (67) of 2024. Based on our verification activities, we conclude that the greenhouse gas assertion is materially correct and is a fair representation of the GHG data and information."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Self-Declaration</h3>
                <p>
                  This report has been prepared by {reportData.company.name} in accordance with the requirements 
                  of Federal Decree-Law No. (11) of 2024 and Cabinet Resolution No. (67) of 2024. Third-party 
                  verification is not required as total emissions are below the 25,000 tCO₂e threshold.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Management Declarations */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">7. Management Declarations</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Declaration of Accuracy and Completeness</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <p className="text-sm">
                    I declare that the information contained in this emissions report is accurate and complete 
                    to the best of my knowledge and belief.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <p className="text-sm">
                    I confirm that all material emission sources have been identified and included 
                    in accordance with the reporting requirements.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <p className="text-sm">
                    I acknowledge that this report has been prepared in compliance with Federal Decree-Law 
                    No. (11) of 2024 and Cabinet Resolution No. (67) of 2024.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-4">Authorized Signatory</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="font-medium">{reportData.declarations.authorizedSignatory}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Position:</span>
                    <p className="font-medium">{reportData.declarations.position}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <p className="font-medium">{reportData.declarations.date}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Company Seal</h4>
                <div className="w-32 h-32 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Company Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Annexes */}
        <div className="report-page page-break">
          <h2 className="text-3xl font-bold mb-8">8. Annexes and Supporting Documents</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Attached Documents</h3>
              <div className="space-y-3">
                {reportData.attachments.filter(att => att.uploaded).map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium">{attachment.name}</h4>
                      <p className="text-sm text-muted-foreground">{attachment.description}</p>
                    </div>
                    <Badge variant={attachment.required ? "default" : "secondary"}>
                      {attachment.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">References</h3>
              <ul className="space-y-2 text-sm">
                <li>• Federal Decree-Law No. (11) of 2024 on Climate Change</li>
                <li>• Cabinet Resolution No. (67) of 2024 on the Executive Regulations</li>
                <li>• UAE National Guidelines for Greenhouse Gas Reporting</li>
                <li>• DEWA Emission Factors for Grid Electricity (2024)</li>
                <li>• ADNOC Emission Factors for Natural Gas (2024)</li>
                <li>• IATA Air Travel Emission Factors (2024)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .report-container {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .report-page {
            min-height: 100vh;
            page-break-after: always;
            padding: 0;
            margin: 0;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .report-page:last-child {
            page-break-after: avoid;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .bg-gray-50,
          .bg-blue-50,
          .bg-green-50,
          .bg-orange-50 {
            background-color: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        .report-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          color: black;
        }
        
        .report-page {
          padding: 2cm;
          min-height: calc(297mm - 4cm);
        }
      `}</style>
    </div>
  );
}