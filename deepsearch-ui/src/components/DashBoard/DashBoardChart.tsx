// import {
//   CheckOutlined,
//   CloseOutlined,
//   DeleteOutlined,
//   EditOutlined,
//   PlusOutlined,
//   UnorderedListOutlined,
//   CalendarOutlined,
// } from '@ant-design/icons';
// import { Button, Dropdown, Flex, Input, Modal, Skeleton, Space, Typography, message, DatePicker, Spin } from 'antd';
// import React, { useState } from 'react';
// import Chart from '../Chat/Chart';
// import { testPreview } from '@/services/ant-design-pro/api';

// const { Paragraph } = Typography;
// const { TextArea } = Input;
// const { RangePicker } = DatePicker;

// interface DashBoardChartProps {
//   item_data: any;
//   chart_config: any;
//   handleDelete: any;
//   description?: string;
//   handleItemDescription?: any;
//   groupId?: string;
//   itemId?: string;
//   handleCustomStyle?: any;
//   setJsonText?: any;
//   customStyle?: any;
//   agentId?: any;
//   setItemData?: any;
//   handleDatePickerOk?: any
//   dateChartisLoading?: boolean
// }

// const DashBoardChart: React.FC<DashBoardChartProps> = ({
//   item_data,
//   chart_config,
//   handleDelete,
//   description,
//   handleItemDescription,
//   groupId,
//   itemId,
//   handleCustomStyle,
//   setJsonText,
//   customStyle,
//   agentId,
//   handleDatePickerOk,
//   dateChartisLoading,
// }) => {
//   const [openDescriptionField, setOpenDescriptionField] = useState<boolean>(false);
//   const [itemDescription, setItemDescription] = useState<string>(description);
//   const [opendashBoardStyleModal, setOpendashBoardStyleModal] = useState(false);
//   const [dashBoardTextInput, setDashBoardTextInput] = useState('');
//   const [open, setOpen] = useState(false);
//   const [insight, setInsight] = useState('');
//   const [timestamp, setTimestamp] = useState<number>(Date.now());
//   const [openDatePickerModal, setOpenDatePickerModal] = useState(false);
//   const [selectedDateRange, setSelectedDateRange] = useState<string[]>([]);
//   const [results, setResults] = useState('');
//   // const [setHidePublish, setHidePublish]=props;
//   // const [itemData, setItemData] = useState(item_data);
//   const items: MenuProps['items'] = [
//     {
//       label: 'Delete',
//       key: '1',
//       icon: <DeleteOutlined />,
//       danger: true,
//     },
//     {
//       label: 'Edit',
//       key: '2',
//       icon: <EditOutlined />,
//     },
//     {
//       label: 'Add Style',
//       key: '4',
//       icon: <PlusOutlined />,
//     },
//   ];

//   const showDescriptionField = () => {
//     setOpenDescriptionField(true);
//   };

//   const hideDescriptionField = () => {
//     setOpenDescriptionField(false);
//   };

//   const hideModal = () => {
//     setOpen(false);
//     setInsight('');
//   };

//   const handleDashBoardStyleHide = () => {
//     setDashBoardTextInput(JSON.stringify(customStyle));
//     setOpendashBoardStyleModal(true);
//   };

//   const handleMenuClick: MenuProps['onClick'] = (e: { key: string; }) => {
//     if (e.key === '1') {
//       handleDelete();
//     }
//     if (e.key === '2') {
//       showDescriptionField();
//     }
//     if (e.key === '4') {
//       handleDashBoardStyleHide();
//     }
//   };

//   const menuProps = {
//     items,
//     onClick: handleMenuClick,
//   };

//   const handleCheckOutSubmit = () => {
//     handleItemDescription(itemDescription, groupId, itemId);
//     setOpenDescriptionField(false);
//   };

//   const handleDashBoardCustomStyle = () => {
//     if (dashBoardTextInput.trim().length > 0) {
//       setOpendashBoardStyleModal(false);
//       try {
//         const parsedContent = JSON.parse(dashBoardTextInput);
//         handleCustomStyle(groupId, itemId, parsedContent);
//         setJsonText(parsedContent);
//         setTimestamp(Date.now());
//       } catch (e) {
//         message.error('Please Enter Valid JSON');
//       }
//     } else {
//       setOpendashBoardStyleModal(false);
//       handleCustomStyle(groupId, itemId, 'None');
//       setJsonText('None');
//       setTimestamp(Date.now());
//     }
//   };

//   const handleDashBoardTextInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
//     setDashBoardTextInput(e.target.value);
//   };

//   const handleDashboardStyleCancel = () => {
//     setOpendashBoardStyleModal(false);
//   };

//   return (
//     <>
//       <Flex justify="space-between" align="center">
//         <Flex align="center">
//           <Flex justify="center" align="center">
//             {openDescriptionField ? (
//               <Input
//                 suffix={[
//                   <Button
//                     key={'1'}
//                     type="text"
//                     icon={<CheckOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
//                     onClick={handleCheckOutSubmit}
//                   />,
//                   <Button
//                     key={'2'}
//                     type="text"
//                     icon={
//                       <CloseOutlined
//                         style={{ color: 'rgba(0,0,0,.45)' }}
//                         onClick={hideDescriptionField}
//                       />
//                     }
//                   />,
//                 ]}
//                 value={itemDescription}
//                 onChange={(e) => setItemDescription(e.target.value)}
//                 style={{ width: '100%' }}
//               />
//             ) : (
//               <Paragraph style={{ marginBottom: '0px' }}>{description}</Paragraph>
//             )}
//           </Flex>
//         </Flex>
//         <Space>
//           <Dropdown menu={menuProps} trigger={['click']}>
//             <Space>
//               <UnorderedListOutlined />
//             </Space>
//           </Dropdown>
//           {/* <CalendarOutlined
//             style={{ fontSize: '18px', cursor: 'pointer' }}
//             onClick={() => setOpenDatePickerModal(true)}
//           /> */}
//           <Dropdown
//             trigger={['click']}
//             overlay={
//               <div
//                 style={{
//                   padding: '8px',
//                   background: '#fff',
//                   border: '1px solid #d9d9d9',
//                   borderRadius: '4px',
//                   width: '300px',
//                 }}
//               >
//                 <RangePicker
//                   showTime={{ format: 'HH:mm' }}
//                   format="YYYY-MM-DD HH:mm"
//                   onChange={(dates, dateStrings) => {
//                     setSelectedDateRange(dates ? dateStrings : []); // Update state with the selected date range
//                   }}
//                 />
//                 <div style={{ marginTop: '8px', textAlign: 'right' }}>
//                   <Button
//                     type="primary"
//                     onClick={() => {
//                       setOpenDatePickerModal(false); // Close the dropdown
//                       if (selectedDateRange.length === 2) {
//                         handleDatePickerOk(
//                           groupId,
//                           itemId,
//                           agentId,
//                           selectedDateRange
//                         ); // Call the function with selectedDateRange
//                       }
//                     }}
//                     disabled={!selectedDateRange || selectedDateRange.length < 2} // Disable if dates are incomplete
//                     loading={dateChartisLoading}
//                   >
//                     OK
//                   </Button>
//                 </div>
//               </div>
//             }
//           >
//             <CalendarOutlined
//               style={{ fontSize: '18px', cursor: 'pointer' }}
//             />
//           </Dropdown>
//         </Space>
//       </Flex>
//       <Chart tableData={item_data.table_data} key={timestamp} chart_config={chart_config} />
//       <Modal
//         title="Edit Charts Styles"
//         open={opendashBoardStyleModal}
//         onOk={handleDashBoardCustomStyle}
//         onCancel={handleDashboardStyleCancel}
//         okText="Add"
//         cancelText="Cancel"
//       >
//         <TextArea
//           value={dashBoardTextInput}
//           onChange={handleDashBoardTextInputChange}
//           placeholder="Type JSON string..."
//         />
//       </Modal>
//       <Modal
//         title="Select Date Range"
//         open={openDatePickerModal}
//         onCancel={() => setOpenDatePickerModal(false)}
//         onOk={() => {
//           setOpenDatePickerModal(false);
//           if (selectedDateRange.length === 2) {
//             handleDatePickerOk(groupId, itemId, agentId, selectedDateRange); // Call the function with selectedDateRange
//           }
//         }}
//         okButtonProps={{
//           disabled: !selectedDateRange || selectedDateRange.length < 2, // Disable if start or end date is missing
//         }}
//       >
//         <RangePicker
//           showTime={{ format: 'HH:mm' }}
//           format="YYYY-MM-DD HH:mm"
//           onChange={(dates, dateStrings) => {
//             setSelectedDateRange(dates ? dateStrings : []); // Update state with the selected date range
//           }}
//         />
//       </Modal>

//       <Modal
//         title="Insights"
//         open={open}
//         onCancel={hideModal}
//         footer={[
//           <Button key="close" onClick={hideModal}>
//             Close
//           </Button>,
//         ]}
//       >
//         {insight === '' ? <Skeleton active /> : insight}
//       </Modal>
//     </>
//   );
// };

// export default DashBoardChart;
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Flex, Input, Modal, Skeleton, Space, Typography, message, DatePicker, Spin, Tag } from 'antd';
import React, { useState } from 'react';
import Chart from '../Chat/Chart';
import { testPreview } from '@/services/ant-design-pro/api';

const { Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface DashBoardChartProps {
  item_data: any;
  chart_config: any;
  handleDelete: any;
  description?: string;
  handleItemDescription?: any;
  groupId?: string;
  itemId?: string;
  handleCustomStyle?: any;
  setJsonText?: any;
  customStyle?: any;
  agentId?: any;
  setItemData?: any;
  handleDatePickerOk?: any
  dateChartisLoading?: boolean
}

const DashBoardChart: React.FC<DashBoardChartProps> = ({
  item_data,
  chart_config,
  handleDelete,
  description,
  handleItemDescription,
  groupId,
  itemId,
  handleCustomStyle,
  setJsonText,
  customStyle,
  agentId,
  handleDatePickerOk,
  dateChartisLoading,
}) => {
  const [openDescriptionField, setOpenDescriptionField] = useState<boolean>(false);
  const [itemDescription, setItemDescription] = useState<string>(description);
  const [opendashBoardStyleModal, setOpendashBoardStyleModal] = useState(false);
  const [dashBoardTextInput, setDashBoardTextInput] = useState('');
  const [open, setOpen] = useState(false);
  const [insight, setInsight] = useState('');
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [openDatePickerModal, setOpenDatePickerModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string[]>([]);
  const [results, setResults] = useState('');
  // const [setHidePublish, setHidePublish]=props;
  // const [itemData, setItemData] = useState(item_data);
  console.log('itemdata,s2312213',item_data?.selected_date)
  const items: MenuProps['items'] = [
    {
      label: 'Delete',
      key: '1',
      icon: <DeleteOutlined />,
      danger: true,
    },
    {
      label: 'Edit',
      key: '2',
      icon: <EditOutlined />,
    },
    {
      label: 'Add Style',
      key: '4',
      icon: <PlusOutlined />,
    },
  ];

  const showDescriptionField = () => {
    setOpenDescriptionField(true);
  };

  const hideDescriptionField = () => {
    setOpenDescriptionField(false);
  };

  const hideModal = () => {
    setOpen(false);
    setInsight('');
  };

  const handleDashBoardStyleHide = () => {
    setDashBoardTextInput(JSON.stringify(customStyle));
    setOpendashBoardStyleModal(true);
  };

  const handleMenuClick: MenuProps['onClick'] = (e: { key: string; }) => {
    if (e.key === '1') {
      handleDelete();
    }
    if (e.key === '2') {
      showDescriptionField();
    }
    if (e.key === '4') {
      handleDashBoardStyleHide();
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleCheckOutSubmit = () => {
    handleItemDescription(itemDescription, groupId, itemId);
    setOpenDescriptionField(false);
  };

  const handleDashBoardCustomStyle = () => {
    if (dashBoardTextInput.trim().length > 0) {
      setOpendashBoardStyleModal(false);
      try {
        const parsedContent = JSON.parse(dashBoardTextInput);
        handleCustomStyle(groupId, itemId, parsedContent);
        setJsonText(parsedContent);
        setTimestamp(Date.now());
      } catch (e) {
        message.error('Please Enter Valid JSON');
      }
    } else {
      setOpendashBoardStyleModal(false);
      handleCustomStyle(groupId, itemId, 'None');
      setJsonText('None');
      setTimestamp(Date.now());
    }
  };

  const handleDashBoardTextInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setDashBoardTextInput(e.target.value);
  };

  const handleDashboardStyleCancel = () => {
    setOpendashBoardStyleModal(false);
  };

  return (
    <>
     {item_data?.selected_date
 && (
        <div style={{position:'absolute',right:0,top:7}}>   
            <Tag bordered={true}>From: {item_data?.selected_date?.[0]}</Tag>
            <Tag  bordered={true}>To: {item_data?.selected_date?.[1]}</Tag>
        </div>
     )}
      <Flex justify="space-between" align="center" style={{paddingTop:'7px'}}>
        <Flex align="center">
          <Flex justify="center" align="center">
            {openDescriptionField ? (
              <Input
                suffix={[
                  <Button
                    key={'1'}
                    type="text"
                    icon={<CheckOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                    onClick={handleCheckOutSubmit}
                  />,
                  <Button
                    key={'2'}
                    type="text"
                    icon={
                      <CloseOutlined
                        style={{ color: 'rgba(0,0,0,.45)' }}
                        onClick={hideDescriptionField}
                      />
                    }
                  />,
                ]}
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                style={{ width: '100%' }}
              />
            ) : (
              <Paragraph style={{ marginBottom: '0px' }}>{description}</Paragraph>
            )}
          </Flex>
        </Flex>
        <Space>
          <Dropdown menu={menuProps} trigger={['click']}>
            <Space>
              <UnorderedListOutlined />
            </Space>
          </Dropdown>
          {/* <CalendarOutlined
            style={{ fontSize: '18px', cursor: 'pointer' }}
            onClick={() => setOpenDatePickerModal(true)}
          /> */}
          <Dropdown
            trigger={['click']}
            overlay={
              <div
                style={{
                  padding: '8px',
                  background: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  width: '300px',
                }}
              >
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  onChange={(dates, dateStrings) => {
                    setSelectedDateRange(dates ? dateStrings : []); // Update state with the selected date range
                  }}
                />
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setOpenDatePickerModal(false); // Close the dropdown
                      if (selectedDateRange.length === 2) {
                        handleDatePickerOk(
                          groupId,
                          itemId,
                          agentId,
                          selectedDateRange
                        ); // Call the function with selectedDateRange
                      }
                    }}
                    disabled={!selectedDateRange || selectedDateRange.length < 2} // Disable if dates are incomplete
                    loading={dateChartisLoading}
                  >
                    OK
                  </Button>
                </div>
              </div>
            }
          >
            <CalendarOutlined
              style={{ fontSize: '18px', cursor: 'pointer' }}
            />
          </Dropdown>
        </Space>
      </Flex>
      <Chart tableData={item_data.table_data} key={timestamp} chart_config={chart_config} />
      <Modal
        title="Edit Charts Styles"
        open={opendashBoardStyleModal}
        onOk={handleDashBoardCustomStyle}
        onCancel={handleDashboardStyleCancel}
        okText="Add"
        cancelText="Cancel"
      >
        <TextArea
          value={dashBoardTextInput}
          onChange={handleDashBoardTextInputChange}
          placeholder="Type JSON string..."
        />
      </Modal>
      <Modal
        title="Select Date Range"
        open={openDatePickerModal}
        onCancel={() => setOpenDatePickerModal(false)}
        onOk={() => {
          setOpenDatePickerModal(false);
          if (selectedDateRange.length === 2) {
            handleDatePickerOk(groupId, itemId, agentId, selectedDateRange); // Call the function with selectedDateRange
          }
        }}
        okButtonProps={{
          disabled: !selectedDateRange || selectedDateRange.length < 2, // Disable if start or end date is missing
        }}
      >
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={(dates, dateStrings) => {
            setSelectedDateRange(dates ? dateStrings : []); // Update state with the selected date range
          }}
        />
      </Modal>

      <Modal
        title="Insights"
        open={open}
        onCancel={hideModal}
        footer={[
          <Button key="close" onClick={hideModal}>
            Close
          </Button>,
        ]}
      >
        {insight === '' ? <Skeleton active /> : insight}
      </Modal>
    </>
  );
};

export default DashBoardChart;
