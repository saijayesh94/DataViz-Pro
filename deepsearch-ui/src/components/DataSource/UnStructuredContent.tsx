import { insertDataSource } from '@/services/ant-design-pro/api';
import { useNavigate } from '@umijs/max';
import type { FormProps } from 'antd';
import { Button, Form, Input, message } from 'antd';

function UnStructuredContent() {
  const navigate = useNavigate();

  const onFinish: FormProps['onFinish'] = async (values) => {
    console.log('Success:', values);
    const payload = {
      type: 'text_source',
      action: 'insert',
      ds_name: values.ds_name,
      display_name: values.display_name,
      credentials: null,
    };
    const resp = await insertDataSource(payload);
    if (resp?.status === 'success') {
      message.success('Data Source Created Successfully.');
      navigate('/datasources');
    } else {
      message.error(resp?.message || 'Failed To Create Data Source');
    }
  };

  const handleBackButton = () => {
    navigate('/datasources');
  };

  return (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      colon={false}
      requiredMark={false}
      labelWrap
      onFinish={onFinish}
    >
      <Form.Item
        label="Display Name"
        name="display_name"
        rules={[
          { required: true, message: 'Please enter Display Name' },
          { whitespace: true, message: 'Display Name cannot be empty' },
        ]}
      >
        <Input placeholder="Please enter Display Name" />
      </Form.Item>

      <Form.Item
        label="DS Name"
        name="ds_name"
        rules={[
          { required: true, message: 'Please enter the DataSource Name' },
          { whitespace: true, message: 'DataSource Name cannot be empty' },
        ]}
      >
        <Input placeholder="Please enter the DataSource Name" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 0 }} style={{ textAlign: 'right' }}>
        <Button htmlType="submit" onClick={handleBackButton} style={{ marginRight: '15px' }}>
          Back
        </Button>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default UnStructuredContent;
