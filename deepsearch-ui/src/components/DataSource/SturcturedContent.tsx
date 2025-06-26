import { insertDataSource } from '@/services/ant-design-pro/api';
import { useNavigate } from '@umijs/max';
import type { FormProps, SelectProps } from 'antd';
import { Button, Divider, Form, Input, Select, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

const options: SelectProps['options'] = [];

const { Option } = Select;

// const onFinish: FormProps['onFinish'] = (values) => {
//   console.log('Success:', values);
//   const insertDS = async () => {
//     const payload = {
//       "db_name": values.db_name,
//       "name": values.name,
//       "action": "insert",
//       "credentials": {
//         "username": "root",
//         "password": "root@123",
//         "port": 3306,
//         "host": "127.0.0.1"
//       }
//     }
//     const data = await insertDataSource(payload);
//     if (data.resp_obj) {
//       navigate('/datasources');
//     }

//   };
//   insertDS();
// };

const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const StructuredContent = ({ mode, data }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  console.log('mode', mode);

  console.log('atad', data);

  const handleBackButton = () => {
    navigate('/datasources');
  };

  const onFinish: FormProps['onFinish'] = async (values) => {
    setLoading(true);
    if (mode !== 'edit') {
      console.log('Success:', values);
      const payload = {
        ds_name: values.db_name,
        type: 'mysql',
        display_name: values.name,
        action: 'insert',
        credentials: {
          username: values.username,
          password: values.password,
          port: values.port,
          host: String(values.host),
        },
      };
      try {
        const data = await insertDataSource(payload);
        if (data?.status === 'success') {
          message.success('Data Source Connected Successfully.');
          setLoading(false)
          navigate('/datasources');
        } else {
          message.error(data?.message || 'Failed To Connect Data Source');
          setLoading(false)
        }
      } catch (error) {
        message.error(data?.message || 'Error while connecting to the Data Source.');
        setLoading(false)
      }
    }
  };

  return (
    <Form
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      labelCol={{ span: 5 }}
      labelWrap
      colon={false}
      initialValues={
        mode === 'edit'
          ? {
            name: data.name, // Prefill Data Source Name
            db_name: data.environment, // Prefill Database Name
          }
          : {}
      }
    >
      <Form.Item label="Name Of The Source" name="name">
        <Input placeholder="Data Source Name" />
      </Form.Item>

      <Form.Item label="Tenancy" name="Tenancy">
        <Select defaultValue="Multi Tenant">
          <Option value="Multi Tenant">Multi Tenant</Option>
          <Option value="Single Tenant">Single Tenant</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Environment" name="Environment">
        <Select placeholder="Please select a country">
          <Option value="Production">Production</Option>
          <Option value="Development">Development</Option>
        </Select>
      </Form.Item>

      <Divider />

      <Form.Item label="Host & Port" style={{ marginBottom: '0px' }}>
        <Space>
          <Form.Item name="host">
            <Input placeholder="Host" />
          </Form.Item>

          <Form.Item name="port">
            <Input placeholder="Port" />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item label="DataBase Name" name="db_name">
        <Input placeholder="DataBase Name" disabled={mode === 'edit'} />
      </Form.Item>

      <Form.Item label="Username & Password" style={{ marginBottom: 0 }}>
        <Form.Item name="username" style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Schemas" name="Schemas">
        <Select mode="tags" style={{ width: '100%' }} placeholder="Schemas" options={options} />
      </Form.Item>

      <Divider />

      <Form.Item label="SSH Config" name="SSH Config">
        <Select defaultValue="Do not use SSH credentials">
          <Option value="Do not use SSH credentials">Do not use SSH credentials</Option>
          <Option value="Use SSH credentials">Use SSH credentials</Option>
        </Select>
      </Form.Item>

      <Form.Item style={{ textAlign: 'right' }}>
        <Button htmlType="submit" onClick={handleBackButton} style={{ marginRight: '15px' }}>
          Back
        </Button>
        <Button type="primary" disabled={loading} loading={loading} htmlType="submit">
          {mode === 'edit' ? 'Update' : 'Submit'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StructuredContent;
