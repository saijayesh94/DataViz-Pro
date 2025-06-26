import { SyncMessage, addDashboardAndGroups, saveItems } from '@/services/ant-design-pro/api';
import {
  AreaChartOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  PushpinOutlined,
  SyncOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useModel, useParams } from '@umijs/max';
import type { InputRef, MenuProps, TableProps } from 'antd';
import {
  Button,
  Card,
  Divider,
  Dropdown,
  Flex,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import DashBoardChart from '../DashBoard/DashBoardChart';
import Chart from './Chart';

const { Paragraph } = Typography;

// interface chart_configProp {
//   chart_type: string;
//   xField: string;
//   yField: string;
//   category: string;
// }

interface ChatVisualizationCardProp {
  item_data: any;
  columnsData: any;
  setSideBarConfig: any;
  DashBoardView?: boolean;
  description?: string;
  handleDelete?: any;
  groupId?: string;
  itemId?: string;
  agentId?: string;
  handleItemDescription?: any;
  index?: any;
  content?: any;
  schemaName: any;
  convId: any;
  handleCustomStyle?: any;
  customStyle?: any;
  disableExtras?: boolean;
  graphDefault?: boolean;
  handleDatePickerOk?: any;
  dateChartisLoading?: boolean;
}

const ChatVisualizationCard: React.FC<ChatVisualizationCardProp> = ({
  item_data,
  columnsData,
  setSideBarConfig,
  DashBoardView, //display chart in dashboard
  description, //for rendering itemTitle
  handleDelete, //for deleting individual Item
  groupId, //for tracking groupId used only while editing
  itemId, //for tracking itemId used only while editing
  agentId,
  handleItemDescription, //for editing itemTitle
  index,
  content,
  schemaName,
  convId,
  handleCustomStyle,
  customStyle,
  disableExtras,
  graphDefault,
  handleDatePickerOk,
  dateChartisLoading,
}) => {


  const [showTable, setShowTable] = useState<boolean>(true);
  const [openSave, setOpenSave] = useState<boolean>(false);
  const [newDashBoardName, setNewDashBoardName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [modalLoading, setmodalLoading] = useState<boolean>(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const inputRef = useRef<InputRef>(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [openStyleModal, setOpenStyleModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [jsonText, setJsonText] = useState(customStyle);
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [syncTime, setSyncTime] = useState<string>();
  const dashBoardMenuData = initialState?.currentUser?.dashBoardMenuData;
  const [dashBoardItems, setDashBoardItems] = useState<any[]>(dashBoardMenuData);
  const [itemData, setItemData] = useState(item_data);
  const [syncLoad, setSyncLoad] = useState(false);
  console.log('itemdata', itemData);
  console.log('columndata', columnsData);
  const params: any = useParams();
  const { TextArea } = Input;

  const items: MenuProps['items'] = [
    {
      label: 'Explain',
      key: '1',
      icon: <InfoCircleOutlined />,
    },
    {
      label: 'Add Style',
      key: '2',
      icon: <PlusOutlined />,
    },
  ];

  const onDashBoardNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDashBoardName(event.target.value);
  };

  const onGroupNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(event.target.value);
  };

  // function to add new DashBoards and Groups
  const handleAddItem = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    isGroupItem: boolean = false,
  ) => {
    e.preventDefault();
    setmodalLoading(true);
    let isValid = false;
    if (!isGroupItem && newDashBoardName.length > 0) {
      isValid = true;
    } else if (isGroupItem && newGroupName.length > 0) {
      isValid = true;
    }
    if (isValid) {
      let resp;
      if (isGroupItem) {
        try {
          resp = await addDashboardAndGroups(
            newDashBoardName,
            newGroupName,
            selectedDashboardId,
            initialState?.currentUser?.email,
          );
          console.log('Response of group:', resp);
          if (resp?.status === 'success') {
            setmodalLoading(false);
            message.success('Group Added Successfully');
          } else {
            message.error('Failed To Add The Group');
            setmodalLoading(false);
          }
        } catch {
          setmodalLoading(false);
        }
      } else {
        try {
          resp = await addDashboardAndGroups(
            newDashBoardName,
            null,
            null,
            initialState?.currentUser?.email,
          );
          console.log('Response of dashboard:', resp);
          if (resp?.status === 'success') {
            message.success('DashBoard Added Successfully');
            setDashBoardItems(resp?.resp_obj);
            setmodalLoading(false);
          } else {
            message.error('Failed To Add the DashBoard');
            setmodalLoading(false);
          }
        } catch {
          setmodalLoading(false);
        }
      }

      if (resp?.resp_obj) {
        setInitialState((s: any) => ({
          ...s,
          currentUser: {
            ...initialState?.currentUser,
            dashBoardMenuData: resp.resp_obj
              ? resp.resp_obj
              : initialState?.currentUser?.dashBoardMenuData,
          },
        }));
        setDashBoardItems(resp?.resp_obj);
        console.log("dashBoardMenuData :: ", dashBoardMenuData);
      }
      setNewGroupName('');
      setNewDashBoardName('');
      setmodalLoading(false);
    } else {
      message.error('Please enter valid name');
      setmodalLoading(false);
    }
  };

  useEffect(() => {
    const selectedDashboard = dashBoardItems.find((item) => item._id === selectedDashboardId);
    if (selectedDashboard) {
      setFilteredGroups(selectedDashboard.groups);
    } else {
      setFilteredGroups([]);
    }
  }, [selectedDashboardId, initialState]);

  // function that tell whcih dashBoard is selected
  const handleDashBoardSelectChange = (value: any) => {
    setSelectedDashboardId(value);
    setSelectedGroupId(null);
  };

  // function that tell whcih group is selected
  const handleGroupSelectChange = (value: any) => {
    setSelectedGroupId(value);
  };

  // for saving charts to dashBoard
  const showSaveModal = () => {
    setOpenSave(true);
  };

  // for saving charts to dashBoard
  const hideSaveModal = () => {
    setOpenSave(false);
  };

  console.log('index', typeof index);

  // function to save and send the chart to the dashBorad
  const DashBoardhandleSubmit = async () => {
    try {
      if (selectedDashboardId && selectedGroupId) {
        const jsonTextData = JSON.stringify(jsonText);
        const resp = await saveItems(
          params.new === 'new' ? convId : params.new,
          index,
          columnsData,
          itemData?.chart_rec,
          selectedDashboardId,
          selectedGroupId,
          content,
          initialState?.currentUser?.email,
          schemaName,
          jsonTextData,
        );
        if (resp?.status === 'success') {
          message.success('Chart Saved Sucessfully');
          setOpenSave(false);
        } else {
          message.error('Failed To Save Chart');
        }
      } else {
        message.error('Please Select Both The Fields');
      }
    } catch (error) {
      message.error('Failed to Save Chart.');
    }
  };

  const chart_types = (props: any, p0?: any, fourthColumnName?: string | null) => {
    //for  bar , Column , Scatter graph
    let chart_config: any = {
      chart_type: props?.chart_type,
      xField: props?.xField, //string
      yField: props?.yField, //integer
      colorField: props?.category, //string
      style: { maxWidth: 50 },
      // label: {
      //   text: (d) => {
      //     const value = d[props?.yField];
      //     return typeof value === 'number' ? value.toFixed(4) : props?.yField;
      //   },
      //   textBaseline: 'bottom',
      //   position: props?.chart_type === 'BAR' ? 'inside' : 'top',
      // },
      ...jsonText,
    };
    if (chart_config.chart_type === 'LINE') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'SVG') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer 
        colorField: props.category, //string
        stack: true,
        sort: {
          reverse: true,
          by: 'y',
        },
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'SANKEY') {
      const colors = [
        '#5B8FF9',
        '#61DDAA',
        '#65789B',
        '#F6BD16',
        '#7262fd',
        '#78D3F8',
        '#9661BC',
        '#F6903D',
        '#008685',
        '#F08BB4',
        '#78D3F8',
        '#9661BC',
        '#F6903D',
        '#008685',
        '#F08BB4',
      ];
      const rawData = itemData?.table_data || [];
      // Map the raw data into the format required for Sankey
      const data = rawData.map((item: any) => ({
        source: item[props.xField],  // dynamic source based on xField
        target: item[props.category],  // dynamic target based on category
        value: item[props.yField],  // dynamic value based on yField
      }));
      chart_config = {
        chart_type: props.chart_type,
        data: data, // Directly using the mapped data
        scale: { color: { range: colors } },
        sourceField: 'source',
        targetField: 'target',
        weightField: 'value',
        colorField: 'target',
        // sourceField: props.xField,
        // weightField: props.yField,
        // targetField: props.category,
        // colorField: props.category,
        layout: {
          nodeWidth: 0.01,
          nodeSort: (a: { value: number; }, b: { value: number; }) => b.value - a.value,
        },
        linkColorField: (d: { source: { key: any; }; }) => d.source.key,

        ...jsonText,
      };
    }

    if (chart_config.chart_type === 'MULTI_LINE') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer
        colorField: props.category, //string
        ...jsonText,
      };
    }
    //for Pie graph
    if (chart_config.chart_type === 'PIE') {
      chart_config = {
        chart_type: props.chart_type,
        angleField: props.yField, //integer
        colorField: props.xField, //string
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'DONUT') {
      chart_config = {
        innerRadius: 0.6,
        chart_type: props.chart_type,
        angleField: props.yField, //integer
        colorField: props.xField,
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'AREA') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer
        colorField: props.category, //string
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'STACK_AREA') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer
        colorField: props.category, //string
        shapeField: 'smooth',
        stack: true,
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'STACKED_COLUMN') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer
        colorField: props.category, //string
        stack: true,
        // sort: {
        //   reverse: true,
        //   by: 'y',
        // },
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'GROUPED_COLUMN') {
      chart_config = {
        chart_type: props.chart_type,
        xField: props.xField, //string
        yField: props.yField, //integer
        colorField: props.category, //string
        group: true,
        style: {
          inset: 5,
        },
        ...jsonText,
      };
    }
    if (chart_config.chart_type === 'GROUP_AND_STACK_COLUMN') {
      console.log('fourthColumnName :',fourthColumnName);
      chart_config = {
        chart_type: 'GROUP_AND_STACK_COLUMN',
        xField: props?.xField,
        yField: props?.yField,
        seriesField: fourthColumnName,
        stack: {
          groupBy: ['x', 'series'],
          series: false,
        },
        colorField: props?.category,
        // style: {
        //   inset: 0,
        // },
        ...jsonText,
        tooltip: (item: any) => {
          return { origin: item };
        },
        interaction: {
          tooltip: {
            render: (e: any, { title, items }: any) => {
              return (
                <div>
                  <h4>{title}</h4>
                  {items.map((item: { name: any; color: any; origin: any; }) => {
                    const { name, color, origin } = item;
                    return (
                      <div>
                        <div style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: color,
                                marginRight: 6,
                              }}
                            ></span>
                            <span>
                              {origin[props?.category]} - {name}
                            </span>
                          </div>
                          <b style={{ marginLeft: '8px' }}>{origin[props?.yField]}</b>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            },
          },
        },
      };
    }
    return chart_config;
  };
  const allColumns = Object.keys(itemData?.table_data?.[0] || {});
  const usedColumns = [itemData?.chart_rec?.xField, itemData?.chart_rec?.yField, itemData?.chart_rec?.category];
  const fourthColumnName = allColumns.find(col => !usedColumns.includes(col)) || null;
  console.log('allColumns :', allColumns, '\nfourthColumnName :',fourthColumnName);
  const chart_config = chart_types(itemData?.chart_rec, itemData?.table_data || [], fourthColumnName);

  // Extract unique keys
  const uniqueKeys = [
    ...new Set(itemData?.table_data?.map((item: object) => Object.keys(item)).flat()),
  ];
  console.log('uniquekeys', uniqueKeys);
  // Generate dynamic columns
  const columns: any = uniqueKeys?.map((key: any) => ({
    title: columnsData[key]?.display_name ? columnsData[key]?.display_name : key,
    dataIndex: key,
    align:
      columnsData[key]?.data_type &&
        (columnsData[key]?.data_type?.includes('string') ||
          columnsData[key]?.data_type?.includes('varchar'))
        ? 'left'
        : 'right',
    // defaultSortOrder: 'unsorted',
    render: (text: any) => {
      // if (typeof text === 'number') return text.toFixed(2);
      if (typeof text === 'number') return text;
      else return text;
    },
    sorter: (a: any, b: any) => {
      const aValue = a[key];
      const bValue = b[key];
      // Check if the values are numeric
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return aValue - bValue; // Numerical sorting
      } else {
        return String(aValue).localeCompare(String(bValue)); // Text sorting
      }
    },
  }));

  const onChange: TableProps['onChange'] = (sorter: any) => {
    console.log('params', sorter);
  };

  const setSideBarData = () => {
    setSideBarConfig({
      sql_query: itemData?.sql_query ? itemData?.sql_query : null,
      explanation: itemData?.explanation ? itemData?.explanation : null,
      query_status: itemData?.query_status ? itemData?.query_status : null,
      rag_data: itemData?.rag_data ? itemData?.rag_data : null,
    });
  };

  const handleTextButton = () => {
    setOpenStyleModal(true);
  };

  const handleStyleCancel = () => {
    setOpenStyleModal(false);
  };

  const handleStyleOk = () => {
    if (textInput.trim().length > 0) {
      setOpenStyleModal(false);
      try {
        const json = JSON.parse(textInput);
        // const json = eval(`(${textInput})`)
        setJsonText(json);
        setTimestamp(Date.now());
      } catch (error) {
        message.error('Please Enter Valid JSON');
        // setTimestamp(Date.now());
      }
    }
  };

  const handleTextInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setTextInput(e.target.value);
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === '1') {
      setSideBarData();
    }
    if (e.key === '2') {
      handleTextButton();
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleSync = async () => {
    setSyncLoad(true);
    const currentTime = new Date();
    setSyncTime(currentTime.toLocaleString());
    const payload = {
      user_id: initialState?.currentUser?.email,
      convo_id: params.new === 'new' ? convId : params.new,
      convo_index: index.toString(),
    };
    try {
      const data = await SyncMessage(payload);
      if (data?.status === 'success') {
        message.success('Messages Synched Successfully');
        setSyncLoad(false);
        setItemData(data?.resp_obj);
      } else {
        message.error('Failed To Sync Messages');
        setSyncLoad(false);
      }
    } catch {
      setSyncLoad(false);
    }
    // try{
    //   const parsedData = JSON.parse(data.resp_obj);
    //   console.log('parsed',parsedData)
    //   setItemData(parsedData)
    //   console.log('item__data',itemData)
    // }catch(err){
    //   console.log(err)
    // }
  };



  useEffect(() => {
    if (graphDefault) {
      setShowTable(false);
    } else {
      setShowTable(true);
    }
  }, [graphDefault]);

  return (
    <>
      <Card style={{ height: '100%' }}>
        {DashBoardView ? (
          <DashBoardChart
            agentId={agentId}
            item_data={itemData}
            chart_config={chart_config}
            handleDelete={handleDelete}
            description={description}
            handleItemDescription={handleItemDescription}
            groupId={groupId}
            itemId={itemId}
            handleCustomStyle={handleCustomStyle}
            setJsonText={setJsonText}
            customStyle={customStyle}
            handleDatePickerOk={handleDatePickerOk}
            dateChartisLoading={dateChartisLoading}
          />
        ) : (
          <>
            <Flex justify="space-between" align="middle">
              <Flex align="center">
                <Flex justify="center" align="center">
                  <Paragraph style={{ marginBottom: '0px' }}></Paragraph>
                </Flex>
              </Flex>
              <Space>
                <Segmented
                  onChange={(value) => {
                    if (value === 'table') setShowTable(true);
                    else setShowTable(false);
                  }}
                  style={{ margin: 0 }}
                  options={[
                    {
                      value: 'table',
                      icon: (
                        <Tooltip title="Table View">
                          <TableOutlined />
                        </Tooltip>
                      ),
                    },
                    {
                      value: 'chart',
                      icon: (
                        <Tooltip title="Chart View">
                          <AreaChartOutlined />
                        </Tooltip>
                      ),
                    },
                  ]}
                />
                {!disableExtras && (
                  <>
                    <Tooltip title="Save Chart">
                      <Button onClick={showSaveModal} icon={<PushpinOutlined />} />
                    </Tooltip>
                    <Tooltip title={syncTime}>
                      <Button
                        loading={syncLoad}
                        disabled={params.new === 'new'}
                        icon={<SyncOutlined />}
                        onClick={handleSync}
                      >
                        Sync
                      </Button>
                    </Tooltip>
                    <Dropdown menu={menuProps} trigger={['click']}>
                      <Button icon={<UnorderedListOutlined />} />
                    </Dropdown>
                  </>
                )}
              </Space>
            </Flex>
            {showTable ? (
              <Table
                dataSource={itemData.table_data}
                columns={columns}
                bordered
                style={{
                  marginTop: 20,
                  // border: '1px solid rgba(5,5,5,0.06)',
                  // borderRadius: '9px',
                  overflowX: 'scroll',
                }}
                onChange={onChange}
              />
            ) : (
              <Chart
                key={timestamp}
                chart_config={chart_config}
                tableData={itemData.table_data}
                index={index}
              />
            )}
            <Modal
              title="Save Charts to Dashboards"
              open={openSave}
              onOk={DashBoardhandleSubmit}
              onCancel={hideSaveModal}
              okText="Save"
              cancelText="Cancel"
            >
              <Flex justify="flex-start" align="middle" style={{ marginTop: '20px' }}>
                <Paragraph level={5}>Select Dashboard</Paragraph>
                <Select
                  style={{ width: 300, marginLeft: '15px' }}
                  placeholder="Select or Create Dashboard"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space style={{ padding: '0 8px 4px' }}>
                        <Input
                          placeholder="Please enter DashBoardName"
                          ref={inputRef}
                          value={newDashBoardName}
                          onChange={onDashBoardNameChange}
                          onKeyDown={(e) => e.stopPropagation()}
                          onPressEnter={(e) => {
                            handleAddItem(e);
                          }}
                        />
                        <Button
                          type="text"
                          loading={modalLoading}
                          icon={<PlusOutlined />}
                          onClick={(e) => handleAddItem(e)}
                        >
                          Add Dashboard
                        </Button>
                      </Space>
                    </>
                  )}
                  options={dashBoardItems.map((item) => ({ label: item.name, value: item._id }))}
                  onChange={handleDashBoardSelectChange}
                />
              </Flex>
              <Flex justify="flex-start" align="middle" style={{ marginTop: '10px' }}>
                <Paragraph level={5}>Select Group</Paragraph>
                <Select
                  style={{ width: 300, marginLeft: '43px' }}
                  placeholder="Select or Create Group"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space style={{ padding: '0 8px 4px' }}>
                        <Input
                          placeholder="Please enter GroupName"
                          ref={inputRef}
                          value={newGroupName}
                          onChange={onGroupNameChange}
                          onKeyDown={(e) => e.stopPropagation()}
                          onPressEnter={(e) => {
                            handleAddItem(e, true);
                          }}
                        />
                        <Button
                          type="text"
                          loading={modalLoading}
                          icon={<PlusOutlined />}
                          onClick={(e) => handleAddItem(e, true)}
                        >
                          Add Group
                        </Button>
                      </Space>
                    </>
                  )}
                  value={selectedGroupId}
                  options={filteredGroups.map((item) => ({ label: item.name, value: item._id }))}
                  onChange={handleGroupSelectChange}
                />
              </Flex>
            </Modal>
            <Modal
              title="Edit Charts Styles"
              open={openStyleModal}
              onOk={handleStyleOk}
              onCancel={handleStyleCancel}
              okText="Add"
              cancelText="Cancel"
            >
              <TextArea
                value={textInput}
                onChange={handleTextInputChange}
                placeholder="Type JSON string..."
              />
            </Modal>
          </>
        )}
      </Card>
    </>
  );
};

export default ChatVisualizationCard;
