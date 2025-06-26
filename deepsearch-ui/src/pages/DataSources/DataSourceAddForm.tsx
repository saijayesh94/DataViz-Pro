import StructuredTab from '@/components/DataSource/StructuredTab';
import UnStructuredTab from '@/components/DataSource/UnStructuredTab';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { useLocation } from '@umijs/max';

function DataSourceAddForm() {


  const location = useLocation();
  console.log('location',location);

  const data = location?.state?.data;
  const mode = location?.state?.mode;


  return (
    <PageContainer
    title={mode === 'edit'  ? 'Edit Data Source' : 'Add New Data Source'}
    >
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: 'Structured',
            key: '1',
            children: <StructuredTab mode={mode} data={data} />,
            
          },

          {
            label: 'UnStructured',
            key: '2',
            children: <UnStructuredTab />,
           
          }
        ]}
      />
    </PageContainer>
  );
}

export default DataSourceAddForm;
