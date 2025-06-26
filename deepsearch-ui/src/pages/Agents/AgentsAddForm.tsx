import { getAllDataSources, insertAgent } from '@/services/ant-design-pro/api';
import { PageContainer } from '@ant-design/pro-components';
import { useLocation, useNavigate } from '@umijs/max';
import type { FormProps } from 'antd';
import { Button, Form, Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';

const { Option } = Select;

interface DataSources {
  _id: string;
  type: string;
  ds_name: string;
  name: string;
}

const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const AgentsAddForm: React.FC = () => {
  const location = useLocation();
  const mode = location?.state?.mode;
  const data = location?.state?.data;
  const navigate = useNavigate();
  const [allSchemas, setAllSchemas] = useState<DataSources[]>([]);
  const [sqlDataSources, setSqlDataSources] = useState<DataSources[]>([]);
  const [textDataSources, setTextDataSources] = useState<DataSources[]>([]);

  const handleBackButton = () => {
    navigate('/agents');
  };

  const onFinish: FormProps['onFinish'] = async (values) => {
    console.log('Form values:', values);
    let payload;
    if (mode !== 'edit') {
      payload = {
        name: values.name,
        action: 'insert',
        agent_id: '',
        type: values.type,
        datasource_id: String(values.datasource_id),
        rag_datasources: values.ragdata,
      };
    } else {
      payload = {
        name: values.name,
        action: 'update',
        agent_id: data.key,
        type: values.type,
        datasource_id: String(values.datasource_id),
        rag_datasources: values.ragdata,
      };
    }

    console.log('Payload:', payload);

    try {
      const response = await insertAgent(payload);
      console.log('API Response:', response);
      if (response?.status === 'success') {
        message.success('Agent Added Successfully!');
        navigate('/agents/all_agents');
      } else {
        message.error(response?.message || 'Failed to Add Agent.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while connecting the datasource.');
    }
  };

  useEffect(() => {
    const fetchAllDataSources = async () => {
      try {
        const data = await getAllDataSources();
        if (data?.resp_obj) {
          setAllSchemas(data.resp_obj.datasources);
          console.log('scheama', allSchemas);
          const sqlSources: DataSources[] = [];
          const textSources: DataSources[] = [];
          data.resp_obj.datasources.forEach((item: DataSources) => {
            if (item.type === 'mysql') {
              sqlSources.push(item);
            } else {
              textSources.push(item);
            }
          });
          setSqlDataSources(sqlSources);
          setTextDataSources(textSources);
        }
      } catch (error) {
        console.error('Error fetching data sources:', error);
      }
    };
    fetchAllDataSources();
  }, []);

  return (
    <PageContainer title={mode === 'edit' ? 'Edit Agent' : 'Add New Agent'}>
      <Form
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 5 }}
        style={{ maxWidth: 600 }}
        labelWrap
        requiredMark={false}
        initialValues={
          mode === 'edit'
            ? {
                name: data?.name,
                type: data?.type,
                datasource_id: data?.datasource_id,
                ragdata: data?.rag_datasource_id,
              }
            : {}
        }
      >
        <Form.Item
          label="Agent Name"
          name="name"
          rules={[{ required: true, message: 'Please enter agent name' }]}
        >
          <Input placeholder="Name" />
        </Form.Item>

        <Form.Item
          label="Agent Type"
          name="type"
          rules={[{ required: true, message: 'Please select agent type' }]}
        >
          <Select style={{ width: '100%' }} placeholder="Please select">
            <Option value="dashboard_agent">DashBoard Agent</Option>
            <Option value="simple_agent">Simple Agent</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="RAG DataSource"
          name="ragdata"
          rules={[{ required: true, message: 'Please select at least one RAG datasource' }]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            options={[
              {
                label: <span>Select Data Source</span>,
                title: 'Select Data Source',
                options: textDataSources?.map((item: any) => ({
                  label: item.name,
                  value: item._id,
                })),
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Data Sources"
          name="datasource_id"
          rules={[{ required: true, message: 'Please select a datasource' }]}
        >
          <Select
            style={{ width: '100%' }}
            placeholder="Please select"
            options={[
              {
                label: <span>Select Data Source</span>,
                title: 'Select Data Source',
                options: sqlDataSources?.map((item: any) => ({
                  label: item.name,
                  value: item._id,
                })),
              },
            ]}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button type="default" onClick={handleBackButton} style={{ marginRight: '15px' }}>
            Back
          </Button>
          <Button type="primary" htmlType="submit">
            {mode === 'edit' ? 'Update' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

export default AgentsAddForm;
