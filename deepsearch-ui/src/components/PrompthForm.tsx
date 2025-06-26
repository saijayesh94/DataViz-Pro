// import { Button, Form, Input, Select, Typography } from 'antd';
// import React from 'react';

// const { TextArea } = Input;

// const chartTypes = [
//   'BAR',
//   'COLUMN',
//   'SCATTER',
//   'PIE',
//   'LINE',
//   'MULTI_LINE',
//   'DONUT',
//   'AREA',
//   'STACK_AREA',
//   'STACKED_COLUMN',
//   'GROUPED_COLUMN',
//   'GROUP_AND_STACK_COLUMN',
//   'SANKEY',
//   // 'SVG'
// ];

// interface prompthprops {
//   formData?: any;
//   disable: boolean;
//   onChange?: any;
//   onCancel?: any;
//   show?: boolean;
// }

// const PrompthForm: React.FC<prompthprops> = ({ formData, disable, onChange, onCancel, show }) => {
//   const [form] = Form.useForm();

//   const initialValues = formData;

//   const handleFinish = (values) => {
//     console.log('form value', values);
//     onChange(values);
//   };

//   const handleBackButton = () => {
//     onCancel();
//   };

//   return (
//     <Form
//       form={form}
//       initialValues={initialValues}
//       onFinish={handleFinish}
//       layout="vertical"
//       disabled={disable}
//       style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}
//     >
//       {/* Query Details Section */}
//       <div>
//         <Typography.Text strong>Query Details</Typography.Text>
//         <Form.Item
//           label={<Typography.Text>Query Type</Typography.Text>}
//           name="type"
//           style={{ marginBottom: '5px' }}
//         >
//           <Select
//             options={[
//               { value: 'query', label: 'Query' },
//               { value: 'clarification', label: 'Clarification' },
//             ]}
//           />
//         </Form.Item>

//         <Form.Item
//           label={<Typography.Text>Response</Typography.Text>}
//           name="response"
//           style={{ marginBottom: '5px' }}
//         >
//           <TextArea placeholder="Response" style={{ fontSize: 12, height: 48 }} />
//         </Form.Item>

//         <Form.Item
//           label={<Typography.Text>SQL Query</Typography.Text>}
//           name="sql_query"
//           style={{ marginBottom: '5px' }}
//         >
//           <TextArea placeholder="SQL Query" style={{ fontSize: 12, height: 48 }} />
//         </Form.Item>

//         <Form.Item
//           label={<Typography.Text>Explanation</Typography.Text>}
//           name="explanation"
//           style={{ marginBottom: '0px' }}
//         >
//           <TextArea placeholder="Explanation" style={{ fontSize: 12, height: 48 }} />
//         </Form.Item>
//       </div>

//       {/* Chart Config Section */}
//       <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 8 }}>
//         <Typography.Text strong>Chart Config</Typography.Text>
//         <Form.Item
//           label={<Typography.Text>X Field</Typography.Text>}
//           name={['chart_rec', 'xField']}
//           style={{ marginBottom: '5px' }}
//         >
//           <Input placeholder="X Field" style={{ fontSize: 12, height: 28 }} />
//         </Form.Item>

//         <Form.Item
//           label={<Typography.Text>Y Field</Typography.Text>}
//           name={['chart_rec', 'yField']}
//           style={{ marginBottom: '5px' }}
//         >
//           <Input placeholder="Y Field" style={{ fontSize: 12, height: 28 }} />
//         </Form.Item>

//         <Form.Item
//           label={<Typography.Text>Chart Type</Typography.Text>}
//           name={['chart_rec', 'chart_type']}
//           style={{ marginBottom: '5px' }}
//         >
//           <Select options={chartTypes.map((type) => ({ value: type, label: type }))} />
//         </Form.Item>
//         <Form.Item
//           label={<Typography.Text>Category</Typography.Text>}
//           name={['chart_rec', 'category']}
//         >
//           <Input placeholder="Category" style={{ fontSize: 12, height: 28 }} />
//         </Form.Item>

//         {disable === false && show === false && (
//           <Form.Item style={{ textAlign: 'right', marginBottom: '0px' }}>
//             <Button type="primary" htmlType="submit" style={{ marginRight: '15px' }}>
//               {/* {show === false ? 'Update' : "Add"} */}
//               Done
//             </Button>
//             <Button type="default" onClick={handleBackButton}>
//               Cancel
//             </Button>
//           </Form.Item>
//         )}
//       </div>
//     </Form>
//   );
// };

// export default PrompthForm;

import { testPreview } from '@/services/ant-design-pro/api';
import { Button, Form, Input, Select, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import ChatVisualizationCard from './Chat/ChatVisualizationCard';

const { TextArea } = Input;

const chartTypes = [
  { label: 'Bar', value: 'BAR' },
  { label: 'Column', value: 'COLUMN' },
  { label: 'Scatter', value: 'SCATTER' },
  { label: 'Pie', value: 'PIE' },
  { label: 'Line', value: 'LINE' },
  { label: 'Multi line', value: 'MULTI_LINE' },
  { label: 'Donut', value: 'DONUT' },
  { label: 'Area', value: 'AREA' },
  { label: 'Stack area', value: 'STACK_AREA' },
  { label: 'Stacked column', value: 'STACKED_COLUMN' },
  { label: 'Grouped column', value: 'GROUPED_COLUMN' },
  { label: 'Group and stack column', value: 'GROUP_AND_STACK_COLUMN' },
  { label: 'Sankey', value: 'SANKEY' },
  { label: 'Svg', value: 'SVG' },
];

interface PrompthProps {
  formData?: any;
  disable: boolean;
  onChange?: (values: any) => void;
  onCancel?: () => void;
  id?: string;
}

const PrompthForm: React.FC<PrompthProps> = ({
  formData,
  disable,
  onChange,
  onCancel,
  id,
}) => {
  const [form] = Form.useForm();
  const [results, setResults] = useState<any[]>([]);
  const [columnData, setColumnData] = useState<any>(null);
  const [columnOptions, setColumnOptions] = useState<any[]>([]);
  const [chartSelections, setChartSelections] = useState<any>({
    xField: null,
    yField: null,
    chart_type: null,
    category: null
  });
  const [dataReady, setDataReady] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  console.log('id',id);

  // Update chart selections and form when selections change
  const handleChartSelectionChange = (field: string, value: any) => {
    const updatedSelections = {
      ...chartSelections,
      [field]: value
    };

    // Update state
    setChartSelections(updatedSelections);
    // Directly update form values
    form.setFieldsValue({
      chart_rec: updatedSelections
    });

    // If all critical fields are selected, enable data preview
    if (updatedSelections.xField &&
      updatedSelections.yField &&
      updatedSelections.chart_type) {
      setDataReady(true);
    }

    console.log('Updated Chart Selections: ', updatedSelections);

  };

  const handleFinish = (values: any) => {
    console.log('Form values:', values);
    onChange?.(values);
  };

  async function handlePreviewButton(): Promise<void> {
    try {
      setSaveLoading(true);
      const formValues = form.getFieldsValue();
      const payload = {
        sql_query: formValues.sql_query,
        agent_id: id,
        type: 'query',
      };
      console.log('payload',payload)
      const response = await testPreview(payload);

      if (response.status === 'success') {
        const { results, column_data } = response.resp_obj;

        setResults(results);
        setColumnData(column_data);

        const options = Object.keys(column_data).map((key) => ({
          label: column_data[key].display_name,
          value: key,
        }));
        setColumnOptions(options);

        setDataReady(true);
      }
      setSaveLoading(false);
    } catch (error) {
      setSaveLoading(false);
      console.error('Failed to fetch data for visualization:', error);
    }
  }

  // Effect to update form when initial data is loaded
  useEffect(() => {
    if (formData?.chart_rec) {
      const chartRec = formData.chart_rec;
      setChartSelections(chartRec);
      // Update form values to match initial data
      form.setFieldsValue({
        chart_rec: chartRec
      });
    }
  }, [formData, form]);

  return (
    <>
      <Form
        form={form}
        initialValues={formData}
        onFinish={handleFinish}
        layout="vertical"
        disabled={disable}
        style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}
      >
        {/* Query Details Section */}
        <div>
          <Typography.Text strong>Query Details</Typography.Text>
          <Form.Item
            label={<Typography.Text>Query Type</Typography.Text>}
            name="type"
            style={{ marginBottom: '5px' }}
          >
            <Select
              options={[
                { value: 'query', label: 'Query' },
                { value: 'clarification', label: 'Clarification' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<Typography.Text>Response</Typography.Text>}
            name="response"
            style={{ marginBottom: '5px' }}
          >
            <TextArea placeholder="Response" style={{ fontSize: 12, height: 48 }} />
          </Form.Item>

          <Form.Item
            label={<Typography.Text>SQL Query</Typography.Text>}
            name="sql_query"
            style={{ marginBottom: '5px' }}
          >
            <TextArea
              placeholder="SQL Query"
              style={{ fontSize: 12, height: 48 }}
              onChange={() => setDataReady(false)}
            />
          </Form.Item>

          <Form.Item
            label={<Typography.Text>Explanation</Typography.Text>}
            name="explanation"
            style={{ marginBottom: '0px' }}
          >
            <TextArea placeholder="Explanation" style={{ fontSize: 12, height: 48 }} />
          </Form.Item>
        </div>

        {/* Chart Config Section */}
        <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 8 }}>
          <Typography.Text strong>Chart Config</Typography.Text>
          <Form.Item
            label={<Typography.Text>X Field</Typography.Text>}
            name={['chart_rec', 'xField']}
            style={{ marginBottom: '5px' }}
          >
            <Select
              options={columnOptions}
              placeholder="Select X Field"
              style={{ fontSize: 12, height: 28 }}
              value={chartSelections.xField}
              onChange={(value) => { handleChartSelectionChange('xField', value); setDataReady(false); handlePreviewButton(); }}
            />
          </Form.Item>

          <Form.Item
            label={<Typography.Text>Y Field</Typography.Text>}
            name={['chart_rec', 'yField']}
            style={{ marginBottom: '5px' }}
          >
            <Select
              options={columnOptions}
              placeholder="Select Y Field"
              style={{ fontSize: 12, height: 28 }}
              value={chartSelections.yField}
              onChange={(value) => { handleChartSelectionChange('yField', value); setDataReady(false); handlePreviewButton(); }}
            />
          </Form.Item>

          <Form.Item
            label={<Typography.Text>Chart Type</Typography.Text>}
            name={['chart_rec', 'chart_type']}
            style={{ marginBottom: '5px' }}

          >
            <Select
              options={chartTypes.map((type) => ({ value: type.value, label: type.label }))}
              value={chartSelections.chart_type}
              onChange={(value) => { handleChartSelectionChange('chart_type', value); setDataReady(false); handlePreviewButton(); }}
            />
          </Form.Item>

          <Form.Item
            label={<Typography.Text>Category</Typography.Text>}
            name={['chart_rec', 'category']}
          >
            <Select
              options={columnOptions}
              placeholder="Select Category"
              style={{ fontSize: 12, height: 28 }}
              value={chartSelections.category}
              onChange={(value) => { handleChartSelectionChange('category', value); setDataReady(false); handlePreviewButton(); }}
            />
          </Form.Item>

          {disable === false && (
            <Form.Item style={{ textAlign: 'right', marginBottom: '0px' }}>
              <Button type="primary" htmlType="submit" style={{ marginRight: '15px' }}>
                Done
              </Button>
              <Button type="default" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="default"
                onClick={handlePreviewButton}
                style={{ marginLeft: '15px', marginTop: '15px' }}
                loading={saveLoading}
              >
                Preview
              </Button>
            </Form.Item>
          )}
        </div>
      </Form>

      {dataReady && results.length > 0 && (
        <ChatVisualizationCard
          item_data={{
            chart_rec: chartSelections,
            table_data: results,
          }}
          columnsData={columnData}
          setSideBarConfig={undefined}
          schemaName={undefined}
          index={1}
          convId={undefined}
          disableExtras={true}
          graphDefault={false}
        />
      )}
    </>
  );
};

export default PrompthForm;