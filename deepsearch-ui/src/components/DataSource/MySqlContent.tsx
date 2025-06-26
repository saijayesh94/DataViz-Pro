import { getDataSourceDetails } from '@/services/ant-design-pro/api';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Button, Card, Collapse, Flex, Input, List, Switch, Typography, message } from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Paragraph } = Typography;

const MySqlContent = ({ db_name, type, Agenytype }) => {
  const params = useParams();

  const [tablesData, setTablesData] = useState([]);
  const [publishLoad, setPublishLoad] = useState(false);
  const [hidePublish, setHidePublish] = useState(true);

  useEffect(() => {
    const fetchSourceDetails = async () => {
      const data = await getDataSourceDetails({
        datasource_id: params.db_name,
        ds_name: db_name,
        //datasource_id: datasource_id,
        type: type || Agenytype,
        index_name: null,
        action: 'fetch',
        schema_description: null,
      });
      // const data = await getDataSourceDetails({
      //   // id: params.db_name,
      //   datasource_id: params.datasource_id,
      //   type: type,
      //   index_name: null,
      //   action: 'fetch',
      //   schema_description: null,
      // });

      if (data?.resp_obj) {
        const tables = data?.resp_obj?.schema_description?.tables;
        setTablesData(tables);
      }
    };
    fetchSourceDetails();
  }, [db_name, type]);

  const handleInputChange = (tableIndex, columnIndex, field, value) => {
    setTablesData((prevTablesData) => {
      const newTablesData = [...prevTablesData];
      if (columnIndex !== null) {
        // Update column-level field
        if (field === 'enable') {
          // If updating the switch toggle
          newTablesData[tableIndex].columns[columnIndex][field] = value;
        } else {
          // If updating other column fields
          newTablesData[tableIndex].columns[columnIndex][field] = value;
        }
      } else {
        // Update table-level field
        newTablesData[tableIndex][field] = value;
      }
      return newTablesData;
    });
    setHidePublish(false);
  };

  const handlePublishButton = async () => {
    console.log('collapse', tablesData);
    setPublishLoad(true);

    const newData = {
      tables: tablesData,
    };

    console.log('collapse api', newData);

    try {
      const resp = await getDataSourceDetails({
        datasource_id: params.db_name,
        ds_name: db_name,
        action: 'update',
        type: type || Agenytype,
        index_name: null,
        schema_description: newData,
      });
      if (resp?.status === 'success') {
        message.success('Data is Updated Successfully');
        setPublishLoad(false);
        setHidePublish(true);
      } else {
        message.error('Failed To Update The Data');
      }
    } catch (error) {
      message.error('An error occurred while updating the data');
    }
  };

  const renderColumnDetails = (columns, tableIndex) => {
    return (
      <List
        dataSource={columns}
        bordered
        itemLayout="vertical"
        renderItem={(column, columnIndex) => (
          <List.Item
            style={{
              backgroundColor: column.enable ? 'transparent' : 'rgb(245 245 245)',
              borderTopLeftRadius: columnIndex === 0 ? '7px' : '0px',
              borderTopRightRadius: columnIndex === 0 ? '7px' : '0px',
              borderBottomLeftRadius: columnIndex === columns.length - 1 ? '7px' : '0px',
              borderBottomRightRadius: columnIndex === columns.length - 1 ? '7px' : '0px',
            }}
          >
            <Flex
              align="center"
              justify="space-between"
              style={{ paddingBottom: column.enable ? '10px' : null }}
            >
              <Paragraph style={{ marginBottom: '0px', fontWeight: 'normal' }}>
                {column.column_name}
              </Paragraph>

              <Switch
                checked={column.enable}
                onChange={(checked) =>
                  handleInputChange(tableIndex, columnIndex, 'enable', checked)
                }
              />
            </Flex>

            {column.enable && (
              <>
                <Input
                  value={column.display_name}
                  placeholder="display Name"
                  style={{ width: '40%', marginBottom: '15px' }}
                  onChange={(e) =>
                    handleInputChange(tableIndex, columnIndex, 'display_name', e.target.value)
                  }
                />

                <TextArea
                  rows={4}
                  placeholder="Description"
                  value={column.description}
                  onChange={(e) =>
                    handleInputChange(tableIndex, columnIndex, 'description', e.target.value)
                  }
                />
              </>
            )}
          </List.Item>
        )}
      />
    );
  };

  const tableItems = tablesData.map((table, tableIndex) => ({
    key: table.table_name,
    label: `Table Name: ${table.table_name}`,
    children: (
      <>
        <Card style={{ height: 450, overflow: 'auto', padding: '16px 16px' }}>
          <List
            itemLayout="vertical"
            dataSource={[table]}
            renderItem={(item) => (
              <List.Item>
                <Paragraph style={{ fontWeight: '500' }}>Table Description</Paragraph>

                <TextArea
                  rows={4}
                  value={item.description}
                  onChange={(e) =>
                    handleInputChange(tableIndex, null, 'description', e.target.value)
                  }
                />
              </List.Item>
            )}
          />
          <Paragraph style={{ fontWeight: '500', marginBottom: '14px', marginTop: '12px' }}>
            Columns
          </Paragraph>
          {renderColumnDetails(table.columns, tableIndex)}
        </Card>
      </>
    ),
  }));

  return (
    <PageContainer
      extra={
        !hidePublish && (
          <Button type="primary" onClick={handlePublishButton} loading={publishLoad}>
            Publish
          </Button>
        )
      }
    >
      <Collapse items={tableItems} defaultActiveKey={['1']} />
    </PageContainer>
  );
};

export default MySqlContent;
