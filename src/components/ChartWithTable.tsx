
import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
  
  // Handle chart element click
  const handleChartElementClick = (data: any, index: number) => {
    // Call external handler if provided
    if (onChartClick) {
      onChartClick(data, index);
    }
    
    // Update selection
    const newSelection = data.name || data.hashtag || data.hour || data.day || data.keyword || String(data.label);
    
    if (selection === newSelection) {
      // Toggle off if clicking the same item
      setSelection(null);
      setSelectedData(null);
    } else {
      // Select new item
      setSelection(newSelection);
      setSelectedData(filteredData || initialData);
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
          
          {selectedData && selectedData.length > 0 ? (
            <DataTable 
              data={selectedData}
              columns={tableColumns}
              dataType={dataType}
              itemType={itemType}
              showSearch={true}
              showExport={false}
              emptyMessage={`No ${dataType} data available`}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              {selection 
                ? 'No data available for this selection'
                : 'Click on a chart element to see related data'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChartWithTable;
