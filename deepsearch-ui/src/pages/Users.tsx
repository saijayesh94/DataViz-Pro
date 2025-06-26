import { AddUser, FetchUser } from '@/services/ant-design-pro/api';
import { DeleteOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import type { MenuProps, TableProps } from 'antd';
import { Button, Dropdown, Table, message } from 'antd';
import { useEffect, useState } from 'react';

interface DataType {
  name: string;
  email: string;
  role: string;
}

const items: MenuProps['items'] = [
  // {
  //   label: 'Edit',
  //   key: '1',
  //   icon: <EditOutlined />,
  // },
  {
    label: 'Delete',
    key: '2',
    icon: <DeleteOutlined />,
    danger: true,
  },
];

function Users() {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataType[]>([]);

  // setDataSources(data)

  const handleAddUser = () => {
    navigate('/account/users/add');
  };

  const handleRowClick = (record: DataType) => {
    console.log('row', record);
  };

  const fetchAllUsers = async () => {
    const email = localStorage.getItem('email');
    const payload = {
      mailid: email,
    };
    try {
      const response = await FetchUser(payload);
      console.log('resp', response);
      const newdata = response?.resp_obj?.users.map((item) => ({
        key: item._id,
        name: item.name,
        email: item.mailid,
        role: item.type,
      }));
      console.log('new', newdata);
      setDataSources(newdata);
    } catch (err) {
      console.log('err', err);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleUpdateUser = async (record) => {
    const mode = 'edit';
    navigate('/account/users/add', { state: { record, mode } });
  };

  const handledeleteUser = async (record) => {
    const payload = {
      user_id: record.key,
      inserted_by_mailid: localStorage.getItem('email'),
      name: '',
      mailid: record.email,
      type: '',
      action: 'delete',
      password: '',
      accessList: [],
    };
    const resp = await AddUser(payload);
    if (resp.status === 'success') {
      message.success('User Deleted Successfully');
      fetchAllUsers();
    } else {
      message.error('Failed to Delete User');
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e: any, record: DataType) => {
    if (e.key === '1') {
      handleUpdateUser(record);
    }
    if (e.key === '2') {
      console.log(record);
      handledeleteUser(record);
    }
    // if (e.key === '3') {
    //   // handleDelete(record.key);
    // }
    else {
      console.log('click', e);
    }
  };

  const menuProps = (record: DataType) => ({
    items: items,
    onClick: (e: any) => handleMenuClick(e, record),
  });

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'User Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown menu={menuProps(record)} trigger={['click']}>
          <UnorderedListOutlined />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageContainer
        extra={[
          <Button key={'1'} icon={<PlusOutlined />} onClick={handleAddUser}>
            Add User
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={dataSources}
          onRow={(record: DataType) => ({ onClick: () => handleRowClick(record) })}
        />
      </PageContainer>
    </>
  );
}

export default Users;
