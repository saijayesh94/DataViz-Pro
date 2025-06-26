import { AddUser } from '@/services/ant-design-pro/api';
import { PageContainer } from '@ant-design/pro-components';
import { useLocation, useNavigate } from '@umijs/max';
import type { FormProps } from 'antd';
import { Button, Form, Input, Select, message } from 'antd';

const { Option } = Select;

function AddUsers() {
  const navigate = useNavigate();

  const location = useLocation();
  console.log('location', location);

  const onFinish: FormProps['onFinish'] = async (values) => {
    console.log(values);

    const payload = {
      user_id: '',
      inserted_by_mailid: localStorage.getItem('email'),
      name: values.name,
      mailid: values.email,
      password: values.password,
      action: 'insert',
      type: values.role,
      accessList: values.accessList,
    };

    if (values.password === values.confirmpassword) {
      const response = await AddUser(payload);
      try {
        if (response.status === 'success') {
          message.success('User Added Successfully!');
          navigate('/account/users');
        } else {
          message.error('Failed to Add User.');
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      message.error('Password Do Not Match');
    }
  };

  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const handleBackButton = () => {
    navigate('/account/users');
  };

  return (
    <PageContainer>
      <Form
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 5 }}
        // labelCol={{ span: 8 }}
        // labelAlign="left"
        labelWrap
        name="basic"
        // wrapperCol={{ flex: 1 }}
        colon={false}
        // wrapperCol={{ span: 15 }}
        requiredMark={false}
        style={{ maxWidth: 500 }}
      >
        <Form.Item
          label="First Name"
          name="name"
          rules={[{ required: true, message: 'Please Enter First Name' }]}
        >
          <Input placeholder="Enter First Name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter email' }]}
        >
          <Input placeholder="Enter Email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please Enter password' }]}
        >
          <Input placeholder="Enter Password" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmpassword"
          rules={[{ required: true, message: 'Please password' }]}
        >
          <Input placeholder="Re-Enter Password" />
        </Form.Item>

        <Form.Item
          label="Role Type"
          name="role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select placeholder="Select Role">
            <Option value="admin">Admin</Option>
            <Option value="user">User</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Access"
          name="accessList"
          rules={[{ required: true, message: 'Please select at least one component' }]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please Select Access List"
          >
            <Option value="conversations">Conversations</Option>
            <Option value="dashboard">Dashboard</Option>
            <Option value="Data Sources">Data Source</Option>
            <Option value="Agents">Agents</Option>
            <Option value="Settings">Settings</Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button type="default" onClick={handleBackButton} style={{ marginRight: '15px' }}>
            Back
          </Button>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
}

export default AddUsers;
