import {
  AreaChartOutlined,
  BarChartOutlined,
  PieChartFilled,
  TableOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Select, Typography } from 'antd';
import React, { useState } from 'react';

// const { Text } = Typography;

// Define chart types and their corresponding options
const chart_types: { [key: string]: string[] } = {
  donut: ['category', 'yField'],
  pie: ['category', 'yField'],
  bar: ['xField', 'yField', 'category'],
  column: ['xField', 'yField', 'category'],
  area: ['xField', 'yField'],
  multi: ['xField', 'yField', 'category'],
  stacked: ['xField', 'yField', 'category'],
};

// Display names for chart types
const chart_display_names = {
  donut: 'Donut Chart',
  pie: 'Pie Chart',
  bar: 'Bar Chart',
  column: 'Column Chart',
  area: 'Area Chart',
  multi: 'Multi line chart',
  stacked: 'Stacked Column Chart',
};

// Define interface for column options
interface Column {
  key: string;
  value: string;
}

// Define column options for each type
const columns: { [key: string]: Column[] } = {
  category: [
    { key: 'job_id', value: 'Job ID' },
    { key: 'average', value: 'Average Salary' },
  ],
  xField: [
    { key: 'hire', value: 'Hire Date' },
    { key: 'hire2', value: 'Hire Date2' },
  ],
  yField: [
    { key: 'salary', value: 'Salary' },
    { key: 'average', value: 'Average Salary' },
  ],
};

const columns_display_names = {
  category: 'Category',
  xField: 'X Axis',
  yField: 'Y Axis',
  view: 'View',
};

const DesignComponent: React.FC = ({ initialChartConfig }) => {
  const [selectedView, setSelectedView] = useState<string | null>(initialChartConfig.view);
  const [selectedChartType, setSelectedChartType] = useState<string>('donut');

  // Initialize chartConfig state with the first options from columns
  // const initialChartConfig: { [key: string]: string } = {};
  // Object.keys(columns).forEach((key) => {
  //   initialChartConfig[key] = columns[key][0].key;
  // });
  // initialChartConfig['view'] = 'chart'; // Set default value for 'view'
  // console.log("CG", initialChartConfig)
  // {
  //   "category": "job_id",
  //   "xField": "hire",
  //   "yField": "salary",
  //   "view": "chart"
  // }
  const [chartConfig, setChartConfig] = useState<{ [key: string]: string }>(initialChartConfig);

  const updateChartConfig = (key: string, value: string) => {
    const updatedConfig = {
      ...chartConfig,
      [key]: value,
    };
    setChartConfig(updatedConfig);
    console.log('Updated configuration:', updatedConfig);
  };

  // Event handlers
  const handleViewChange = (value: string) => {
    setSelectedView(value);
    updateChartConfig('view', value);
  };

  const handleChartTypeChange = (value: string) => {
    setSelectedChartType(value);
    updateChartConfig('chart_type', value);
  };

  return (
    <div>
      {/* View Options */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '2px solid rgba(211, 211, 211, 1)',
          paddingBottom: '.5rem',
          fontSize: '13px',
        }}
      >
        <span>
          <TableOutlined />
        </span>
        <span style={{ marginLeft: '8px' }}>
          <Typography>View Options</Typography>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', marginBottom: '-7px' }}>
        <div style={{ padding: '8px' }}>
          <span>
            <Typography>View</Typography>
          </span>
        </div>
        <div style={{ padding: '8px' }}>
          <Select
            defaultValue={chartConfig.view}
            style={{ display: 'flex' }}
            onChange={handleViewChange}
          >
            <Select.Option value="chart">
              <div style={{ display: 'flex' }}>
                <span>
                  <BarChartOutlined />
                </span>
                <div style={{ marginLeft: '12px' }}>Chart</div>
              </div>
            </Select.Option>
            <Select.Option value="table">
              <div style={{ display: 'flex' }}>
                <span>
                  <TableOutlined />
                </span>
                <div style={{ marginLeft: '12px' }}>Table</div>
              </div>
            </Select.Option>
          </Select>
        </div>
      </div>

      {/* Chart Options */}
      {selectedView === 'chart' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr' }}>
            <div style={{ padding: '8px' }}>
              <span>
                <Typography>Chart type</Typography>
              </span>
            </div>
            <div style={{ padding: '8px' }}>
              <Select
                defaultValue={chartConfig.chart_type}
                style={{ display: 'flex', maxHeight: '150px', overflowY: 'auto' }}
                onChange={handleChartTypeChange}
              >
                {Object.entries(chart_display_names).map(([key, value]) => (
                  <Select.Option key={key} value={key}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {key === 'donut' && <ThunderboltOutlined />}
                      {key === 'pie' && <PieChartFilled />}
                      {key === 'bar' && <BarChartOutlined />}
                      {key === 'column' && <BarChartOutlined />}
                      {key === 'area' && <AreaChartOutlined />}
                      {key === 'multi' && <ThunderboltOutlined />}
                      {key === 'stacked' && <BarChartOutlined />}
                      <div style={{ marginLeft: '12px' }}>{value}</div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '2px solid rgba(211, 211, 211, 1)',
                paddingBottom: '.5rem',
                fontSize: '13px',
              }}
            >
              <span>
                <BarChartOutlined />
              </span>
              <span style={{ marginLeft: '8px' }}>
                <Typography>Chart Options</Typography>
              </span>
            </div>
            {chart_types[selectedChartType] && (
              <>
                {chart_types[selectedChartType].map((type) => (
                  <div
                    key={type}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.5fr',
                      marginBottom: '-7px',
                    }}
                  >
                    <div style={{ padding: '8px' }}>
                      <span>
                        <Typography>{columns_display_names[type]}</Typography>
                      </span>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <Select
                        defaultValue={chartConfig[type]}
                        style={{ display: 'flex' }}
                        onChange={(newValue) => updateChartConfig(type, newValue)}
                      >
                        {columns[type].map((column) => (
                          <Select.Option key={column.key} value={column.key}>
                            <div>{column.value}</div>
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignComponent;
