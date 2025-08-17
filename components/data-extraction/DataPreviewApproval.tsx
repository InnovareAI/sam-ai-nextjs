/**
 * Data Preview & Approval Component
 * Allows users to review previewed data and approve full extraction
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Download, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BarChart3,
  Filter
} from 'lucide-react';

interface PreviewRecord {
  id: string;
  name?: string;
  title?: string;
  company?: string;
  location?: string;
  industry?: string;
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive';
  profile_completeness: number;
  relevance_score: number;
}

interface PreviewData {
  preview_id: string;
  extraction_type: string;
  total_available: number;
  preview_count: number;
  preview_data: PreviewRecord[];
  cost_estimate: {
    preview_cost: number;
    full_extraction_cost: number;
    currency: string;
  };
  extraction_metadata: {
    estimated_duration: number;
    data_quality_score: number;
    source_reliability: number;
  };
}

interface DataPreviewApprovalProps {
  previewData: PreviewData;
  onApprove: (approvalData: any) => void;
  onReject: () => void;
  isProcessing?: boolean;
}

export default function DataPreviewApproval({ 
  previewData, 
  onApprove, 
  onReject, 
  isProcessing = false 
}: DataPreviewApprovalProps) {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [approvalType, setApprovalType] = useState<'all' | 'selected' | 'bulk'>('all');
  const [showBulkOptions, setShowBulkOptions] = useState(false);

  const handleRecordSelection = (recordId: string, selected: boolean) => {
    if (selected) {
      setSelectedRecords(prev => [...prev, recordId]);
    } else {
      setSelectedRecords(prev => prev.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRecords(previewData.preview_data.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const calculateSelectedCost = () => {
    const costPerRecord = previewData.cost_estimate.full_extraction_cost / previewData.total_available;
    return selectedRecords.length * costPerRecord;
  };

  const handleApprove = () => {
    const approvalData = {
      preview_id: previewData.preview_id,
      approved_extraction_type: approvalType,
      selected_ids: approvalType === 'selected' ? selectedRecords : undefined,
      max_records: approvalType === 'all' ? previewData.total_available : selectedRecords.length
    };
    onApprove(approvalData);
  };

  const setupBulkWorkflow = () => {
    const bulkData = {
      preview_id: previewData.preview_id,
      batch_size: 100,
      total_records: previewData.total_available
    };
    onApprove({ ...bulkData, approved_extraction_type: 'bulk' });
  };

  return (
    <div className="space-y-6">
      {/* Preview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Data Preview - {previewData.extraction_type.replace('_', ' ').toUpperCase()}
          </CardTitle>
          <CardDescription>
            Preview of {previewData.preview_count} records from {previewData.total_available} total available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{previewData.total_available}</div>
              <div className="text-sm text-gray-600">Total Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${previewData.cost_estimate.full_extraction_cost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Full Extraction Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(previewData.extraction_metadata.estimated_duration / 60)}m
              </div>
              <div className="text-sm text-gray-600">Estimated Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(previewData.extraction_metadata.data_quality_score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Quality Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Options */}
      <Tabs value={approvalType} onValueChange={(value) => setApprovalType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Extract All</TabsTrigger>
          <TabsTrigger value="selected">Extract Selected</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Extract All Records
              </CardTitle>
              <CardDescription>
                Extract all {previewData.total_available} records with complete contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${previewData.cost_estimate.full_extraction_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Estimated Duration:</span>
                    <span className="text-sm">
                      {Math.floor(previewData.extraction_metadata.estimated_duration / 60)} minutes
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleApprove} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Approve Full Extraction'}
                  </Button>
                  <Button variant="outline" onClick={onReject}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Extract Selected Records
              </CardTitle>
              <CardDescription>
                Choose specific records to extract with full contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedRecords.length === previewData.preview_data.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="font-medium">
                      Select All Previewed ({previewData.preview_data.length})
                    </label>
                  </div>
                  <Badge variant="secondary">
                    {selectedRecords.length} selected
                  </Badge>
                </div>

                {/* Preview Records List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {previewData.preview_data.map((record) => (
                    <div key={record.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={(checked) => handleRecordSelection(record.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{record.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-600">
                          {record.title} at {record.company}
                        </div>
                        <div className="text-xs text-gray-500">{record.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Relevance: {(record.relevance_score * 100).toFixed(0)}%
                        </div>
                        <Progress value={record.profile_completeness * 100} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRecords.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Selected Records Cost:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${calculateSelectedCost().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleApprove}
                    disabled={selectedRecords.length === 0 || isProcessing}
                    className="flex-1"
                  >
                    Extract {selectedRecords.length} Selected
                  </Button>
                  <Button variant="outline" onClick={onReject}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Bulk Extraction Workflow
              </CardTitle>
              <CardDescription>
                For large datasets (1000+ records), set up batch-by-batch approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Recommended for Large Datasets</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Process {previewData.total_available} records in batches of 100. 
                    Review and approve each batch before extraction.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-lg font-bold">
                      {Math.ceil(previewData.total_available / 100)}
                    </div>
                    <div className="text-sm text-gray-600">Total Batches</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-lg font-bold">100</div>
                    <div className="text-sm text-gray-600">Records per Batch</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Workflow Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Review data quality before each batch</li>
                    <li>• Control costs by approving only high-quality batches</li>
                    <li>• Pause or stop extraction at any time</li>
                    <li>• Get partial results while processing continues</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button onClick={setupBulkWorkflow} className="flex-1">
                    Setup Bulk Workflow
                  </Button>
                  <Button variant="outline" onClick={onReject}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Privacy-First Approach</h4>
              <p className="text-sm text-green-700 mt-1">
                Preview shows only public information (names, titles, companies). 
                Contact details (emails, LinkedIn profiles, phone numbers) are extracted 
                only after your approval and stored securely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}