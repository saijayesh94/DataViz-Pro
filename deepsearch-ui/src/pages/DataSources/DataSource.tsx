import { getAllDataSources } from '@/services/ant-design-pro/api';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import type { MenuProps, TableProps } from 'antd';
import { Button, Dropdown, Table } from 'antd';
import { useEffect, useState } from 'react';

interface DataType {
  key: string;
  name: string;
  tenancy: string;
  environment: string;
  type: string;
  status: string;
  lastUpdated: string;
}

const items: MenuProps['items'] = (record: DataType) => {
  return record.type === 'text_source'
    ? [
        {
          label: 'Edit',
          key: '1',
          icon: <EditOutlined />,
        },
        {
          label: 'Delete',
          key: '3',
          icon: <DeleteOutlined />,
          danger: true,
        },
      ]
    : [
        {
          label: 'Edit',
          key: '1',
          icon: <EditOutlined />,
        },
        // {
        //   label: 'Edit Prompt',
        //   key: '2',
        //   icon: <EditOutlined />,
        // },
        {
          label: 'Edit DataSource',
          key: '2',
          icon: <EditOutlined />,
        },
        {
          label: 'Delete',
          key: '3',
          icon: <DeleteOutlined />,
          danger: true,
        },
      ];
};

function DataSource() {
  const [dataSources, setDataSources] = useState([]);
  const navigate = useNavigate();

  const handleEditClick = (db_name: any) => {
    const type = db_name.type;
    const data = db_name.environment;
    console.log('db_name', db_name);
    navigate(`/datasources/${db_name.key}`, { state: { type, data } });
  };

  // const handleEditPrompt = (db_name: any) => {
  //   // const ds_name = db_name.environment;
  //   navigate(`/prompt/${db_name.key}`, { state: { db_name } });
  // };

  const handleEditDataSource = (data: any) => {
    const mode = 'edit';
    navigate(`/datasources/new_data_source`, { state: { data, mode } });
    console.log('db_name record', data);
  };

  const handleMenuClick: MenuProps['onClick'] = (e: any, record: string) => {
    if (e.key === '1') {
      handleEditClick(record);
    }
    if (e.key === '2') {
      handleEditDataSource(record);
    } else {
      console.log('click', e);
    }
  };

  const menuProps = (record) => ({
    items: items(record),
    onClick: (e: any) => handleMenuClick(e, record),
  });

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 350,
    },
    {
      title: 'Tenancy',
      dataIndex: 'tenancy',
      key: 'tenancy',
    },
    {
      title: 'DS Name',
      dataIndex: 'environment',
      key: 'environment',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Last updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
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

  useEffect(() => {
    const fetchAllDataSources = async () => {
      const data = await getAllDataSources();
      if (data?.resp_obj) {
        const newData = data?.resp_obj?.datasources.map((item: any) => ({
          key: item._id,
          name: item.name,
          tenancy: 'Multi',
          environment: item.ds_name,
          type: item.type,
          status: 'Onboarded',
          lastUpdated: 'Few Minutes Ago',
        }));
        setDataSources(newData);
      }
    };
    fetchAllDataSources();
  }, []);

  const handleRowClick = (record: any) => {
    console.log('row', record);
    // navigate(`/datasources/${record.environment}`);
  };

  const handleDataSourceButton = () => {
    navigate('/datasources/new_data_source');
  };

  return (
    <PageContainer
      extra={[
        <Button key={'1'} icon={<PlusOutlined />} onClick={handleDataSourceButton}>
          Add Data Source
        </Button>,
      ]}
    >
      <Table
        columns={columns}
        dataSource={dataSources}
        onRow={(record: any) => ({ onClick: () => handleRowClick(record) })}
      />
    </PageContainer>
  );
}

export default DataSource;
