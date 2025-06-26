import { getAllAgents, getAllDataSources } from '@/services/ant-design-pro/api';
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
  type: string;
  rag_datasource: string;
  datasource: string;
  status: string;
  lastUpdated: string;
}

const items: MenuProps['items'] = [
  {
    label: 'Edit',
    key: '1',
    icon: <EditOutlined />,
  },
  {
    label: 'Edit Prompt',
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

const Agents = () => {
  const [dataSources, setDataSources] = useState<DataType[]>([]);
  const navigate = useNavigate();

  const handleEditClick = (data: any) => {
    const mode = 'edit';
    navigate(`/agents/new_agents`, { state: { data, mode } });
  };

  const handleEditPrompt = (data: any) => {
    navigate(`/agents/prompt/${data.key}`, { state: { data } });
  };

  const handleMenuClick: MenuProps['onClick'] = (e: any, record: DataType) => {
    if (e.key === '1') {
      handleEditClick(record);
    }
    if (e.key === '2') {
      handleEditPrompt(record);
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
      title: 'Agent Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'RAG DataSource',
      dataIndex: 'rag_datasource',
      key: 'rag_datasource',
    },
    {
      title: 'DataSource',
      dataIndex: 'datasource',
      key: 'datasource',
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
      try {
        // Fetch data sources and agents
        const dataSourcesResponse = await getAllDataSources();
        const agentsResponse = await getAllAgents();

        // Log the responses for debugging
        console.log('DataSources Response:', dataSourcesResponse);
        console.log('Agents Response:', agentsResponse);

        // Check if responses are in the expected format
        if (
          dataSourcesResponse?.resp_obj &&
          Array.isArray(dataSourcesResponse?.resp_obj.datasources) &&
          agentsResponse?.resp_obj
        ) {
          // Create a map from data sources
          const dataSourceMap = dataSourcesResponse?.resp_obj?.datasources.reduce(
            (acc: Record<string, string>, ds: any) => {
              acc[ds._id] = ds.name;
              return acc;
            },
            {},
          );
          console.log('reduce accmulator', dataSourceMap);

          // Map agents to include names instead of IDs
          const newData = agentsResponse.resp_obj.agents.map((agent: any) => ({
            key: agent._id,
            name: agent.name,
            type: agent.type,
            rag_datasource: agent.rag_datasources
              .map((rag_ds_id: string) => dataSourceMap[rag_ds_id] || rag_ds_id)
              .join(', '),
            datasource: dataSourceMap[agent.datasource_id] || agent.datasource_id,
            status: 'Onboarded',
            lastUpdated: 'Few Minutes Ago',
            datasource_id: agent?.datasource_id,
            rag_datasource_id: agent?.rag_datasources,
          }));

          // Update state with new data
          setDataSources(newData);
          console.log('New Data:', newData);
        } else {
          console.error(
            'Data sources response is not in the expected format or agents response is missing.',
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllDataSources();
  }, []);

  const handleRowClick = (record: DataType) => {
    console.log('row', record);
    //navigate(`/agents/${record.environment}`);
  };

  const handleDataSourceButton = () => {
    navigate('/agents/new_agents');
  };

  return (
    <PageContainer
      title="Agent"
      extra={[
        <Button key={'1'} icon={<PlusOutlined />} onClick={handleDataSourceButton}>
          Add Agents
        </Button>,
      ]}
    >
      <Table
        columns={columns}
        dataSource={dataSources}
        onRow={(record: DataType) => ({ onClick: () => handleRowClick(record) })}
      />
    </PageContainer>
  );
};

export default Agents;
