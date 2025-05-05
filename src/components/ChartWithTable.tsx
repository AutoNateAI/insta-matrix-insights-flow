
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import DataTable from './DataTable';
import ExportButton from './ExportButton';

interface ChartWithTableProps {
  title: string;
  subtitle?: string;
  chartComponent: React.ReactNode;
  initialData: any[];
  tableColumns: {
    key: string;
    header: string;
    cell?: (item: any) => React.ReactNode;
    isSortable?: boolean;
  }[];
  dataType: 'posts' | 'comments' | 'hashtags' | 'timing' | 'network';
  itemType?: 'post' | 'comment';
  onChartClick?: (data: any, index: number) => void;
  exportFilename?: string;
  className?: string;
  filteredData?: any[];
  showDataOnLoad?: boolean;
}

const ChartWithTable = ({
  title,
  subtitle,
  chartComponent,
  initialData,
  tableColumns,
  dataType,
  itemType = 'post',
  onChartClick,
  exportFilename,
  className,
  filteredData,
  showDataOnLoad = false
}: ChartWithTableProps) => {
  const [selectedData, setSelectedData] = useState<any[] | null>(showDataOnLoad ? initialData : null);
  const [selection, setSelection] = useState<string | null>(null);
  
  // Update selectedData when filteredData changes
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      setSelectedData(filteredData);
    }
  }, [filteredData]);
  
  // Handle chart element click
  const handleChartElementClick = (data: any, index: number) => {
    // Call external handler if provided
    if (onChartClick) {
      onChartClick(data, index);
    }
    
    // Update selection
    const newSelection = data.name || data.hashtag || data.hour || data.day || data.keyword || data.username || String(data.label);
    
    if (selection === newSelection) {
      // Toggle off if clicking the same item
      setSelection(null);
      setSelectedData(null);
    } else {
      // Select new item
      setSelection(newSelection);
      
      // Wait for filtered data to be updated by the parent component
      if (filteredData) {
        console.log(`Setting selected data with ${filteredData.length} items`);
        setSelectedData(filteredData);
      } else {
        console.log('No filtered data available');
      }
    }
  };
  
  return (
    <Card className={`dashboard-card ${className}`}>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Chart side */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="card-title">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {/* Pass the click handler to the chart */}
          <div 
            className="chart-container"
            onClick={(e) => {
              // This helps trigger click events if the chart uses SVG elements
              const target = e.target as HTMLElement;
              if (target.tagName === 'rect' || target.tagName === 'path') {
                // This is just to handle clicks on chart elements
                // The actual data will be handled by the chart component
                console.log('Chart element clicked:', target.tagName);
              }
            }}
          >
            {chartComponent}
          </div>
          
          {selection && (
            <div className="mt-4 text-sm">
              <span className="font-medium">Selected:</span> {selection}
            </div>
          )}
        </div>
        
        {/* Table side */}
        <div className="p-4 border-t md:border-t-0 md:border-l">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-medium">
              {selection ? `Data for: ${selection}` : 'Related Data'}
            </h3>
            
            {selectedData && selectedData.length > 0 && (
              <ExportButton
                variant="outline"
                size="sm"
                filteredData={selectedData}
                dataType={dataType}
                filename={exportFilename || `${dataType}-${selection || 'all'}-export.json`}
              />
            )}
          </div>
          
          {/* Wrap table in ScrollArea for vertical scrolling */}
          <ScrollArea className="h-[400px]">
            {selectedData && selectedData.length > 0 ? (
              <DataTable 
                data={selectedData}
                columns={tableColumns}
                dataType={dataType}
                itemType={itemType}
                showSearch={true}
                showExport={false}
                emptyMessage={`No ${dataType} data available`}
                allowAddToCart={true}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground border rounded-md">
                {selection 
                  ? 'No data available for this selection'
                  : 'Click on a chart element to see related data'}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

export default ChartWithTable;
