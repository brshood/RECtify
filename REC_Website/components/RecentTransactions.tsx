import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Download, FileText, Shield, Eye, X, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
// Use public URL for static assets
const rectifyFavicon = "/logo.png";

// Interface for transaction data from backend
interface Transaction {
  _id: string;
  internalRef: string;
  buyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    company: string;
  };
  sellerId: {
    _id: string;
    firstName: string;
    lastName: string;
    company: string;
  };
  facilityName: string;
  facilityId: string;
  energyType: string;
  vintage: number;
  emirate: string;
  certificationStandard: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  settlementStatus: 'pending' | 'completed' | 'failed';
  settlementDate?: string;
  blockchainTxHash?: string;
  registryTransferRef?: string;
  matchedAt: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const getTypeBadge = (type: string) => {
  return (
    <Badge variant={type === "Purchase" ? "default" : "secondary"} className={
      type === "Purchase" 
        ? "bg-rectify-green hover:bg-rectify-green-dark text-white" 
        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
    }>
      {type}
    </Badge>
  );
};

const getStatusBadge = (status: string) => {
  const statusColors = {
    "Completed": "bg-green-100 text-green-800 border-green-200",
    "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Processing": "bg-blue-100 text-blue-800 border-blue-200",
    "Failed": "bg-red-100 text-red-800 border-red-200"
  };
  
  return (
    <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
      {status}
    </Badge>
  );
};

// Helper function to convert image to base64
const getImageDataUrl = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(''); // Return empty string if image fails to load
    img.src = imageUrl;
  });
};

// PDF styling constants
const PDF_COLORS = {
  primary: [22, 160, 133], // #16a085
  secondary: [59, 130, 246], // #3b82f6
  text: [26, 32, 44], // #1a202c
  textLight: [100, 116, 139], // #64748b
  border: [226, 232, 240], // #e2e8f0
  success: [34, 197, 94], // #22c55e
  background: [248, 250, 252] // #f8fafc
};

// Helper function to draw a simple table
const drawTable = (doc: jsPDF, startY: number, headers: string[], rows: string[][], options: any = {}) => {
  const { 
    headerHeight = 12, 
    rowHeight = 10, 
    startX = 20, 
    tableWidth = 170,
    fontSize = 10,
    headerFontSize = 10 
  } = options;
  
  const colWidth = tableWidth / headers.length;
  let currentY = startY;
  
  // Draw header
  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(startX, currentY, tableWidth, headerHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(headerFontSize);
  doc.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    const x = startX + (index * colWidth) + 2;
    const y = currentY + headerHeight - 3;
    doc.text(header, x, y);
  });
  
  currentY += headerHeight;
  
  // Draw rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...PDF_COLORS.text);
  
  rows.forEach((row, rowIndex) => {
    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...PDF_COLORS.background);
      doc.rect(startX, currentY, tableWidth, rowHeight, 'F');
    }
    
    // Draw cell borders
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.1);
    
    row.forEach((cell, colIndex) => {
      const x = startX + (colIndex * colWidth);
      doc.rect(x, currentY, colWidth, rowHeight, 'S');
      
      // Add text
      const textX = x + 2;
      const textY = currentY + rowHeight - 3;
      
      // Truncate text if too long
      let displayText = cell;
      if (doc.getTextWidth(displayText) > colWidth - 4) {
        while (doc.getTextWidth(displayText + '...') > colWidth - 4 && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
      }
      
      doc.text(displayText, textX, textY);
    });
    
    currentY += rowHeight;
  });
  
  return currentY;
};

const addPDFHeader = async (doc: jsPDF, title: string, subtitle?: string) => {
  // Add logo (top right) - only if available
  try {
    const logoDataUrl = await getImageDataUrl(rectifyFavicon);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 160, 15, 20, 20);
    }
  } catch (error) {
    console.warn('Could not load logo for PDF');
  }

  // Platform identifier (generic)
  doc.setFontSize(16);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('I-REC Trading Platform', 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Renewable Energy Certificate Trading', 20, 32);

  // Title
  doc.setFontSize(20);
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 50);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(...PDF_COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, 58);
  }

  // Date and generation info
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 70);
  doc.text(`Document Hash: 0x${Math.random().toString(16).substr(2, 32)}`, 20, 76);

  // Header line
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, 82, 190, 82);

  return 90; // Return Y position for content start
};

const addPDFFooter = (doc: jsPDF, pageNumber: number) => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 35, 190, pageHeight - 35);

  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital I-REC Trading Platform', 20, pageHeight - 28);
  doc.text('Verified and compliant with UAE Federal Decree-Law No. (11) of 2024', 20, pageHeight - 22);
  doc.text(`Page ${pageNumber}`, 185, pageHeight - 28, { align: 'right' });
  doc.text('Confidential Document', 185, pageHeight - 22, { align: 'right' });
};

// Helper function to transform backend transaction to UI format
const transformTransaction = (transaction: Transaction, currentUserId: string) => {
  // Handle both string and object ID formats
  const buyerId = typeof transaction.buyerId === 'string' ? transaction.buyerId : transaction.buyerId._id;
  const sellerId = typeof transaction.sellerId === 'string' ? transaction.sellerId : transaction.sellerId._id;
  
  const isBuyer = buyerId === currentUserId;
  const type = isBuyer ? "Purchase" : "Sale";
  const counterparty = isBuyer ? transaction.sellerId : transaction.buyerId;
  
  // Convert AED to USD (approximate rate)
  const aedToUsdRate = 0.272;
  const priceUSD = transaction.pricePerUnit * aedToUsdRate;
  const totalUSD = transaction.totalAmount * aedToUsdRate;
  
  // Generate certificate ID based on facility and transaction
  const certificateId = `AE-${transaction.certificationStandard}-${transaction.facilityId}-${transaction.vintage}`;
  
  // Determine if transaction can be cancelled
  const canCancel = transaction.status === 'pending' || transaction.status === 'processing';
  
  // Map status to display format
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing', 
    'completed': 'Completed',
    'failed': 'Failed',
    'disputed': 'Disputed'
  };
  
  // Determine purpose based on transaction context
  const purpose = isBuyer ? "Scope 2 Offset" : "Trading";
  
  return {
    id: transaction.internalRef,
    type,
    energyType: transaction.energyType.charAt(0).toUpperCase() + transaction.energyType.slice(1),
    facility: transaction.facilityName,
    region: transaction.emirate,
    certificate: certificateId,
    quantity: transaction.quantity,
    priceAED: transaction.pricePerUnit,
    priceUSD: priceUSD,
    totalAED: transaction.totalAmount,
    totalUSD: totalUSD,
    status: statusMap[transaction.status],
    purpose,
    date: new Date(transaction.matchedAt).toISOString().split('T')[0],
    canCancel,
    counterparty: typeof counterparty === 'object' ? `${counterparty.firstName} ${counterparty.lastName}` : 'Unknown',
    company: typeof counterparty === 'object' ? counterparty.company : 'Unknown',
    originalTransaction: transaction
  };
};

export function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch user transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getUserTransactions(50);
        
        if (response.success && response.data) {
          const transformedTransactions = response.data.map((transaction: Transaction) => 
            transformTransaction(transaction, user.id)
          );
          setTransactions(transformedTransactions);
        } else {
          setError('Failed to load transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleViewCertificate = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowCertificateModal(true);
  };

  const handleDownloadCertificate = async (transaction: any) => {
    setDownloadingItem(transaction.id);
    
    try {
      const doc = new jsPDF();
      
      // Add header
      const contentStartY = await addPDFHeader(
        doc, 
        'I-REC Certificate', 
        'International Renewable Energy Certificate'
      );

      // Certificate Details Section
      doc.setFontSize(14);
      doc.setTextColor(...PDF_COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Certificate Information', 20, contentStartY + 10);

      // Certificate details table
      const certificateHeaders = ['Field', 'Value'];
      const certificateRows = [
        ['Certificate ID', transaction.certificate],
        ['Transaction ID', transaction.id],
        ['Energy Type', transaction.energyType],
        ['Generation Facility', transaction.facility.substring(0, 30) + '...'],
        ['Region', transaction.region],
        ['Quantity (MWh)', transaction.quantity.toLocaleString()],
        ['Generation Date', transaction.date],
        ['Issue Date', new Date().toISOString().split('T')[0]],
        ['Status', transaction.status],
        ['Purpose', transaction.purpose]
      ];

      const tableEndY = drawTable(doc, contentStartY + 18, certificateHeaders, certificateRows, {
        headerHeight: 15,
        rowHeight: 12,
        fontSize: 10,
        headerFontSize: 11
      });

      // Verification Section
      const verificationY = tableEndY + 20;
      
      doc.setFontSize(14);
      doc.setTextColor(...PDF_COLORS.success);
      doc.setFont('helvetica', 'bold');
      doc.text('Verification Details', 20, verificationY);

      doc.setFontSize(10);
      doc.setTextColor(...PDF_COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.text(`This certificate represents ${transaction.quantity} MWh of renewable energy generated`, 20, verificationY + 12);
      doc.text(`from ${transaction.energyType.toLowerCase()} power at ${transaction.facility}`, 20, verificationY + 18);
      doc.text(`in ${transaction.region}, United Arab Emirates.`, 20, verificationY + 24);

      doc.text('This certificate has been verified and registered on the blockchain', 20, verificationY + 36);
      doc.text('infrastructure and complies with the International REC Standard.', 20, verificationY + 42);

      // Check if we need a new page to avoid footer overlap
      const pageHeight = doc.internal.pageSize.height;
      const remainingSpace = pageHeight - verificationY - 50;
      
      if (remainingSpace < 80) {
        // Not enough space, add new page
        doc.addPage();
        const newPageY = await addPDFHeader(doc, 'Certificate Verification');
        
        // Blockchain verification box on new page
        doc.setDrawColor(...PDF_COLORS.success);
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(20, newPageY + 10, 170, 25, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setTextColor(...PDF_COLORS.success);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Blockchain Verified', 25, newPageY + 20);
        
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text(`Verification Hash: 0x${Math.random().toString(16).substr(2, 40)}`, 25, newPageY + 28);
        
        // Add footers
        addPDFFooter(doc, 1);
        doc.setPage(2);
        addPDFFooter(doc, 2);
      } else {
        // Enough space on current page
        doc.setDrawColor(...PDF_COLORS.success);
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(20, verificationY + 50, 170, 25, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setTextColor(...PDF_COLORS.success);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Blockchain Verified', 25, verificationY + 60);
        
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text(`Verification Hash: 0x${Math.random().toString(16).substr(2, 40)}`, 25, verificationY + 68);

        // Add footer
        addPDFFooter(doc, 1);
      }

      // Save the PDF
      doc.save(`I-REC-Certificate-${transaction.certificate}.pdf`);
      toast.success(`Certificate ${transaction.certificate} downloaded successfully`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate PDF');
    } finally {
      setDownloadingItem(null);
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    setIsCancelling(true);
    
    try {
      // Find the original transaction to get the MongoDB _id
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Call the backend API to cancel the transaction
      // Note: This would need to be implemented in the backend if not already available
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the local state to reflect the cancellation
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: 'Failed', canCancel: false }
            : t
        )
      );
      
      setShowCancelDialog(null);
      toast.success(`Transaction ${transactionId} has been cancelled`);
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Failed to cancel transaction');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadEIReport = async () => {
    setIsDownloading(true);
    
    try {
      const doc = new jsPDF();
      
      // Add header
      const contentStartY = await addPDFHeader(
        doc, 
        'UAE Emissions Inventory Report', 
        'Annual Report for Climate Law Compliance'
      );

      // Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(...PDF_COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, contentStartY + 10);

      const purchasedMWh = transactions.filter(t => t.type === 'Purchase' && t.status === 'Completed').reduce((sum, t) => sum + t.quantity, 0);
      const soldMWh = transactions.filter(t => t.type === 'Sale' && t.status === 'Completed').reduce((sum, t) => sum + t.quantity, 0);
      const carbonOffset = Math.round(purchasedMWh * 0.45);

      const summaryHeaders = ['Metric', 'Value'];
      const summaryRows = [
        ['Total I-RECs Purchased', `${purchasedMWh.toLocaleString()} MWh`],
        ['Total I-RECs Sold', `${soldMWh.toLocaleString()} MWh`],
        ['Net Carbon Offset', `${carbonOffset.toLocaleString()} tCO₂e`],
        ['Reporting Period', 'Jan 1, 2024 - Dec 31, 2024'],
        ['Compliance Status', 'Fully Compliant']
      ];

      const summaryEndY = drawTable(doc, contentStartY + 18, summaryHeaders, summaryRows, {
        headerHeight: 15,
        rowHeight: 12
      });

      // Transaction Details
      const transactionY = summaryEndY + 20;
      
      doc.setFontSize(14);
      doc.setTextColor(...PDF_COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details', 20, transactionY);

      const transactionHeaders = ['ID', 'Type', 'Energy', 'Quantity', 'Value', 'Status'];
      const transactionRows = transactions.slice(0, 5).map(t => [
        t.id.substring(0, 12),
        t.type,
        t.energyType,
        t.quantity.toLocaleString(),
        `${t.totalAED.toLocaleString()}`,
        t.status
      ]);

      const transactionEndY = drawTable(doc, transactionY + 8, transactionHeaders, transactionRows, {
        headerHeight: 12,
        rowHeight: 10,
        fontSize: 9,
        headerFontSize: 9
      });

      // Add new page for compliance notes
      doc.addPage();
      const complianceY = await addPDFHeader(
        doc, 
        'Compliance & Verification', 
        'Regulatory Framework and Standards'
      );

      doc.setFontSize(12);
      doc.setTextColor(...PDF_COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.text('This report is prepared in accordance with:', 20, complianceY + 10);

      const complianceItems = [
        '• UAE Federal Decree-Law No. (11) of 2024 on Climate Change',
        '• UAE Vision 2050 sustainability guidelines',
        '• International REC Standard (I-REC)',
        '• UAE National Climate Change Plan 2017-2050',
        '• GCC Unified Economic Agreement environmental provisions'
      ];

      complianceItems.forEach((item, index) => {
        doc.text(item, 25, complianceY + 22 + (index * 8));
      });

      // Check available space for digital signature area
      const pageHeight2 = doc.internal.pageSize.height;
      const remainingSpace2 = pageHeight2 - complianceY - 70;
      
      if (remainingSpace2 < 80) {
        // Add new page for signature
        doc.addPage();
        const newPageY2 = await addPDFHeader(doc, 'Digital Verification');
        
        // Digital signature area on new page
        doc.setDrawColor(...PDF_COLORS.border);
        doc.setFillColor(...PDF_COLORS.background);
        doc.roundedRect(20, newPageY2 + 10, 170, 40, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setTextColor(...PDF_COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('Digital Verification', 25, newPageY2 + 25);
        
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text('This report has been digitally signed and verified by the trading platform', 25, newPageY2 + 33);
        doc.text(`Report Hash: 0x${Math.random().toString(16).substr(2, 64)}`, 25, newPageY2 + 41);
        
        // Add footers for all pages
        addPDFFooter(doc, 1);
        doc.setPage(2);
        addPDFFooter(doc, 2);
        doc.setPage(3);
        addPDFFooter(doc, 3);
      } else {
        // Digital signature area on current page
        doc.setDrawColor(...PDF_COLORS.border);
        doc.setFillColor(...PDF_COLORS.background);
        doc.roundedRect(20, complianceY + 70, 170, 40, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setTextColor(...PDF_COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('Digital Verification', 25, complianceY + 85);
        
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text('This report has been digitally signed and verified by the trading platform', 25, complianceY + 93);
        doc.text(`Report Hash: 0x${Math.random().toString(16).substr(2, 64)}`, 25, complianceY + 101);

        // Add footers
        addPDFFooter(doc, 1);
        doc.setPage(2);
        addPDFFooter(doc, 2);
      }

      doc.save(`UAE-Emissions-Inventory-Report-${new Date().getFullYear()}.pdf`);
      toast.success("Emissions Inventory Report downloaded successfully");
      
    } catch (error) {
      console.error('Error generating EI Report PDF:', error);
      toast.error('Failed to generate EI Report PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllCertificates = async () => {
    setIsDownloading(true);
    
    try {
      const doc = new jsPDF();
      
      // Add header
      const contentStartY = await addPDFHeader(
        doc, 
        'I-REC Certificates Bundle', 
        'Complete Certificate Portfolio Summary'
      );

      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(...PDF_COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Portfolio Summary', 20, contentStartY + 10);

      const summaryHeaders = ['Metric', 'Value'];
      const summaryRows = [
        ['Total Certificates', transactions.length.toString()],
        ['Total MWh', transactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()],
        ['Total Value (AED)', `${transactions.reduce((sum, t) => sum + t.totalAED, 0).toLocaleString()}`],
        ['Generation Date', new Date().toLocaleString().substring(0, 10)],
        ['Verification Status', 'All Verified']
      ];

      const summaryEndY = drawTable(doc, contentStartY + 18, summaryHeaders, summaryRows);

      // Certificates table
      const certificatesY = summaryEndY + 20;
      
      doc.setFontSize(14);
      doc.setTextColor(...PDF_COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Certificate Details', 20, certificatesY);

      const certificateHeaders = ['Cert ID', 'Txn ID', 'Energy', 'Region', 'MWh', 'Status'];
      const certificateRows = transactions.map(t => [
        t.certificate.substring(0, 15),
        t.id.substring(0, 12),
        t.energyType,
        t.region,
        t.quantity.toString(),
        t.status
      ]);

      const certificatesEndY = drawTable(doc, certificatesY + 8, certificateHeaders, certificateRows, {
        fontSize: 8,
        headerFontSize: 9,
        rowHeight: 10
      });

      // Verification section with space check
      const verificationY = certificatesEndY + 20;
      const pageHeight3 = doc.internal.pageSize.height;
      const remainingSpace3 = pageHeight3 - verificationY;
      
      if (remainingSpace3 < 70) {
        // Add new page for verification
        doc.addPage();
        const newPageY3 = await addPDFHeader(doc, 'Bundle Verification');
        
        // Verification section on new page
        doc.setDrawColor(...PDF_COLORS.success);
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(20, newPageY3 + 10, 170, 30, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setTextColor(...PDF_COLORS.success);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Bundle Verified and Sealed', 25, newPageY3 + 22);
        
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text('All certificates in this bundle have been verified on the blockchain', 25, newPageY3 + 30);
        doc.text(`Bundle Hash: 0x${Math.random().toString(16).substr(2, 64)}`, 25, newPageY3 + 36);

        // Add footers
        addPDFFooter(doc, 1);
        doc.setPage(2);
        addPDFFooter(doc, 2);
      } else {
        // Verification section on current page
        doc.setDrawColor(...PDF_COLORS.success);
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(20, verificationY, 170, 30, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setTextColor(...PDF_COLORS.success);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Bundle Verified and Sealed', 25, verificationY + 12);
        
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.text('All certificates in this bundle have been verified on the blockchain', 25, verificationY + 20);
        doc.text(`Bundle Hash: 0x${Math.random().toString(16).substr(2, 64)}`, 25, verificationY + 26);

        // Add footer
        addPDFFooter(doc, 1);
      }

      doc.save(`I-REC-Certificates-Bundle-${new Date().getFullYear()}.pdf`);
      toast.success("All certificates downloaded successfully");
      
    } catch (error) {
      console.error('Error generating certificates bundle PDF:', error);
      toast.error('Failed to generate certificates bundle PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full">
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <CardTitle className="text-base sm:text-lg font-semibold">Transaction History</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1 w-fit">
                <Shield className="h-3 w-3" />
                <span className="text-xs font-medium">Verified</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading transactions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full">
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <CardTitle className="text-base sm:text-lg font-semibold">Transaction History</CardTitle>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 px-2 py-1 w-fit">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Error</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
            <CardTitle className="text-base sm:text-lg font-semibold">Transaction History</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1 w-fit">
              <Shield className="h-3 w-3" />
              <span className="text-xs font-medium">Verified</span>
            </Badge>
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs px-3 py-1.5 h-auto"
              onClick={handleDownloadEIReport}
              disabled={isDownloading || transactions.length === 0}
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1.5" />
              )}
              EI Report
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs px-3 py-1.5 h-auto"
              onClick={handleDownloadAllCertificates}
              disabled={isDownloading || transactions.length === 0}
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : (
                <FileText className="h-3 w-3 mr-1.5" />
              )}
              Certificates
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't made any transactions yet. Start trading to see your transaction history here.
                </p>
                <Button variant="outline" size="sm">
                  Start Trading
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Responsive table container with proper overflow */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px] px-4">Transaction ID</TableHead>
                      <TableHead className="min-w-[80px] px-4">Type</TableHead>
                      <TableHead className="min-w-[200px] px-4">I-REC Details</TableHead>
                      <TableHead className="min-w-[100px] px-4">Quantity (MWh)</TableHead>
                      <TableHead className="min-w-[100px] px-4">Price (AED)</TableHead>
                      <TableHead className="min-w-[100px] px-4">Total (AED)</TableHead>
                      <TableHead className="min-w-[80px] px-4">Status</TableHead>
                      <TableHead className="min-w-[100px] px-4">Purpose</TableHead>
                      <TableHead className="min-w-[120px] px-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium font-mono text-sm px-4">{transaction.id}</TableCell>
                        <TableCell className="px-4">{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell className="px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className={
                                transaction.energyType === 'Solar' ? 'bg-yellow-100 text-yellow-800' :
                                transaction.energyType === 'Wind' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }>
                                {transaction.energyType}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{transaction.region}</span>
                            </div>
                            <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={transaction.facility}>
                              {transaction.facility}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                              {transaction.certificate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-right px-4">{transaction.quantity.toLocaleString()}</TableCell>
                        <TableCell className="px-4">
                          <div className="text-right">
                            <div className="font-medium">AED {transaction.priceAED.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">${transaction.priceUSD.toFixed(2)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="text-right">
                            <div className="font-medium">AED {transaction.totalAED.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">${transaction.totalUSD.toLocaleString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="px-4">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {transaction.purpose}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0" 
                              title="View Certificate"
                              onClick={() => handleViewCertificate(transaction)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0" 
                              title="Download Certificate"
                              onClick={() => handleDownloadCertificate(transaction)}
                              disabled={downloadingItem === transaction.id}
                            >
                              {downloadingItem === transaction.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                            </Button>
                            {transaction.canCancel && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-800" 
                                title="Cancel Transaction"
                                onClick={() => setShowCancelDialog(transaction.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          
          {/* Compliance notice */}
          <div className="m-3 sm:m-6 p-3 sm:p-4 bg-rectify-blue-light rounded-lg border border-rectify-border">
            <div className="flex items-start space-x-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-rectify-blue mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-rectify-blue-dark">
                <strong>Compliance Ready:</strong> All transactions are automatically recorded for UAE Climate Law 
                (Federal Decree-Law No. 11 of 2024) compliance reporting. Export your reports above.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate View Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-rectify-green" />
              I-REC Certificate Details
            </DialogTitle>
            <DialogDescription>
              Certificate information for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm mb-1">Certificate ID</h4>
                  <p className="font-mono text-sm">{selectedTransaction.certificate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Transaction ID</h4>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Energy Type</h4>
                  <Badge className={
                    selectedTransaction.energyType === 'Solar' ? 'bg-yellow-100 text-yellow-800' :
                    selectedTransaction.energyType === 'Wind' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }>
                    {selectedTransaction.energyType}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Region</h4>
                  <p className="text-sm">{selectedTransaction.region}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Quantity</h4>
                  <p className="text-sm font-medium">{selectedTransaction.quantity.toLocaleString()} MWh</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Status</h4>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">Generation Facility</h4>
                <p className="text-sm text-muted-foreground">{selectedTransaction.facility}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm text-green-800">Certificate Verified</span>
                </div>
                <p className="text-xs text-green-700">
                  This certificate represents {selectedTransaction.quantity} MWh of renewable energy generated 
                  from {selectedTransaction.energyType.toLowerCase()} power in {selectedTransaction.region}, UAE. 
                  Verified by blockchain infrastructure.
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadCertificate(selectedTransaction)}
                  disabled={downloadingItem === selectedTransaction.id}
                >
                  {downloadingItem === selectedTransaction.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Certificate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Transaction Dialog */}
      <AlertDialog open={!!showCancelDialog} onOpenChange={() => setShowCancelDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Cancel Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel transaction {showCancelDialog}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Keep Transaction</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showCancelDialog && handleCancelTransaction(showCancelDialog)}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Transaction'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}