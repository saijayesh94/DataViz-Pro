// import { deleteDashBoard, getDashBoard, testPreview, updateData, updateTimestampsInQuery } from '@/services/ant-design-pro/api';
// import {
//   CheckOutlined,
//   CloseOutlined,
//   DeleteOutlined,
//   EditOutlined,
//   PushpinOutlined,
//   SyncOutlined,
//   UnorderedListOutlined,
// } from '@ant-design/icons';
// import { PageContainer } from '@ant-design/pro-components';
// import { useModel, useNavigate, useParams } from '@umijs/max';
// import type { MenuProps } from 'antd';
// import {
//   Button,
//   Col,
//   Dropdown,
//   Empty,
//   Flex,
//   Input,
//   Popconfirm,
//   Row,
//   Skeleton,
//   Space,
//   Typography,
//   message,
// } from 'antd';
// import { useEffect, useState } from 'react';
// import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
// import ChatVisualizationCard from '../Chat/ChatVisualizationCard';
// const { Title } = Typography;

// function DashContent() {
//   const [data, setData] = useState<any[]>([]);
//   const [openInputField, setOpenInputField] = useState(false); // for GroupTitle modal
//   const [selectedGroupId, setSelectedGroupId] = useState(null); // State to store the selected groupId
//   const [newGroupTitle, setNewGroupTitle] = useState(''); //state to change of input field for groupTitle
//   const [editOpen, setEditOpen] = useState(false); //modal for upated
//   const [originalDashBoardName, setOriginalDashBoardName] = useState(''); // to keep track of original dashBoard name
//   const [newDashBoardName, setNewDashBoardName] = useState(''); // to edit DashBoard Name
//   const navigate = useNavigate();
//   const { initialState, setInitialState } = useModel('@@initialState');
//   const [hidePublish, setHidePublish] = useState<boolean>(true); //to hide Publish Button
//   const [loading, setLoading] = useState(true); // to show Skeleton
//   const [syncing, setSyncing] = useState(true); // to show Skeleton
//   const [loadPublish, setLoadPublish] = useState(false);
//   const [dashBoardInputError, setDashBoardInputError] = useState(false);
//   const [timestamp, setTimestamp] = useState<number>(Date.now());
//   const [results, setResults] = useState();
//   const controller = new AbortController();
//   const signal = controller.signal;
//   const [dateChartisLoading, dateChartsetIsLoading] = useState(false); // Loading state for DashBoardChart

//   console.log('syncing', syncing);

//   const params: any = useParams();

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
//   ];

//   // function for refershing DashBorads
//   const refreshDashBoards = async () => {
//     const resp = await getDashBoard(null, initialState?.currentUser?.email);
//     setInitialState((s: any) => ({
//       ...s,
//       currentUser: {
//         ...initialState?.currentUser,
//         dashBoardMenuData: resp?.resp_obj
//           ? resp?.resp_obj
//           : initialState?.currentUser?.dashBoardMenuData,
//       },
//     }));
//   };

//   // Function to fetch data from the API
//   //   const fetchData = async (cache_data: boolean = true) => {
//   //   try {
//   //     // setLoading(true);
//   //     if (cache_data === false) setSyncing(true);
//   //       const resp = await getDashBoard(params.id, initialState?.currentUser?.email, cache_data); // Call the API
//   //       console.log('Data fetched', resp);
//   //       if (cache_data === false) setSyncing(false);
//   //       setData(resp?.resp_obj?.groups); // Set the response data to the data state
//   //       setLoading(false);
//   //       setHidePublish(true);
//   //       setOriginalDashBoardName(resp?.resp_obj?.name);
//   //       setNewDashBoardName(resp?.resp_obj?.name);
//   //   } catch (error) {
//   //     console.error('Error fetching dashboard data:', error);
//   //     setLoading(false);
//   //   }
//   // };

//   const fetchData = async (cache_data: boolean = true) => {
//     try {
//       // setLoading(true);
//       if (cache_data === false) setSyncing(true);
//       // const api = await fetch('http://52.146.95.100:81/dashboards/fetch', {
//       //   method: 'POST',
//       //   signal: signal,
//       //   headers: {
//       //     Accept: 'application/json',
//       //     'Content-Type': 'application/json',
//       //   },
//       //   body: JSON.stringify({
//       //     dashboard_id: params.id,
//       //     user_id: initialState?.currentUser?.email,
//       //     cache_data: cache_data,
//       //   }),
//       // });
//       const api = await getDashBoard(
//         params.id,
//         initialState?.currentUser?.email,
//         cache_data,
//         signal,
//       );
//       console.log('Data fetched', api);
//       // const resp = await api.json();
//       const resp = api;
//       console.log('resp data', resp);
//       if (cache_data === false) setSyncing(false);
//       setData(resp?.resp_obj?.groups); // Set the response data to the data state
//       setLoading(false);
//       setHidePublish(true);
//       setOriginalDashBoardName(resp?.resp_obj?.name);
//       setNewDashBoardName(resp?.resp_obj?.name);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const performSync = async () => {
//       await fetchData(); // First fetch
//       await fetchData(false); // Second fetch
//       setTimestamp(Date.now());
//     };
//     performSync();
//     refreshDashBoards();
//     return () => {
//       console.log('Aborting previous fetch...');
//       controller.abort();
//     };
//   }, [params]);

//   // function to open inputfield to edit  GroupName
//   const openEditGroupName = (groupId) => {
//     //  and also get groupId and get groupTitle of that id
//     setSelectedGroupId(groupId);
//     setOpenInputField(true);
//     const group = data.find((group) => group._id === groupId);
//     if (group) {
//       setNewGroupTitle(group.group_name);
//     }
//   };

//   //function to hide inputField for Group Name
//   const hideEditGroupName = () => {
//     setOpenInputField(false);
//   };

//   //function to delete individual groups and items
//   const handleDelete = (groupId, itemId = null) => {
//     // If itemId is null, it means the delete operation is for the entire group
//     if (itemId === null) {
//       const updatedData = data.filter((group) => group._id !== groupId);
//       setData(updatedData);
//       setHidePublish(false);
//       setTimestamp(Date.now());
//     } else {
//       // Implement deletion logic here for individual items
//       const updatedData = data?.map((group) => {
//         if (group._id === groupId) {
//           return {
//             ...group,
//             items: group.items.filter((item) => item._id !== itemId),
//           };
//         }
//         return group;
//       });
//       setData(updatedData);
//       setHidePublish(false);
//       setTimestamp(Date.now());
//     }
//   };

//   //actually function to edit the groupName and ItemDescription
//   const handleEdit = (
//     groupId = null,
//     editedTitle = null,
//     itemId = null,
//     editedDescription = null,
//   ) => {
//     // Find the group by groupId
//     const updatedData = data?.map((group) => {
//       if (group._id === groupId) {
//         // If itemId is provided, update item description
//         if (itemId) {
//           return {
//             ...group,
//             items: group?.items?.map((item) => {
//               if (item._id === itemId) {
//                 return {
//                   ...item,
//                   description: editedDescription,
//                 };
//               }
//               return item;
//             }),
//           };
//         }
//         // If editedTitle is provided, update group title
//         if (editedTitle) {
//           return {
//             ...group,
//             group_name: editedTitle,
//           };
//         }
//       }
//       return group;
//     });
//     setData(updatedData); //save the cahanges to the API data
//     setHidePublish(false);
//   };

//   // function to submit the NewgroupName
//   const handleGroupNameSubmit = () => {
//     if (!selectedGroupId) return;
//     handleEdit(selectedGroupId, newGroupTitle); //function to edit groupTitle
//     setOpenInputField(false);
//   };

//   //below is the function for ChatVisualizationCard to edit ItemTitle and save the changes to the Api data
//   const handleItemDescription = (editedDescription: string, groupId: string, itemId: string) => {
//     handleEdit(groupId, null, itemId, editedDescription);
//   };

//   // menu Data onclick functions
//   const handleMenuClick: MenuProps['onClick'] = (e: any, groupId: string) => {
//     if (e.key === '1') {
//       handleDelete(groupId);
//     }
//     if (e.key === '2') {
//       openEditGroupName(groupId);
//     }
//     //  else {
//     //   console.log('click', e);
//     // }
//   };

//   const menuProps = (groupId: string) => ({
//     items,
//     onClick: (e: any) => handleMenuClick(e, groupId),
//   });

//   //function for  reordering items when drag and drop occurs
//   function reorderItems(source: any, destination: any, data: any) {
//     console.log('reorder', data);
//     const sourceGroup = data.find((group) => group._id === source.droppableId);
//     const destinationGroup = data.find((group) => group._id === destination.droppableId);
//     // const sourceIndex = sourceGroup.items.findIndex((item) => item._id === source.draggableId);
//     // const destinationIndex = destinationGroup.items.findIndex(
//     //   (item) => item._id === destination.draggableId,
//     // );
//     const sourceIndex = source.index;
//     const destinationIndex = destination.index;

//     if (source.droppableId === destination.droppableId && sourceIndex === destinationIndex) {
//       setHidePublish(true);
//       return data; // Return the original data as no reordering is needed
//     }

//     const updatedData = [...data];

//     if (source.droppableId !== destination.droppableId) {
//       const [removedItem] = sourceGroup.items.splice(sourceIndex, 1);
//       destinationGroup.items.splice(destinationIndex, 0, removedItem);
//       setHidePublish(false);
//     } else {
//       const [reorderedItem] = sourceGroup.items.splice(sourceIndex, 1);
//       sourceGroup.items.splice(destinationIndex, 0, reorderedItem);
//       setHidePublish(false);
//     }
//     return updatedData;
//   }

//   //function for drag operations
//   const onDragEnd = (result: any) => {
//     if (!result.destination) {
//       return;
//     }
//     setTimestamp(Date.now());
//     console.log('drag_operation', result);
//     // calling the reorderItem()
//     const updatedData = reorderItems(result.source, result.destination, data);
//     setData(updatedData); //after reordering save the  data to API
//   };

//   // function to save the changes on click of Publish Button
//   const handlePublishButton = async () => {
//     setLoadPublish(true);
//     const resp = await updateData(params.id, null, data, initialState?.currentUser?.email);
//     setLoadPublish(false);
//     setHidePublish(true);
//     if (resp.status === 'success') {
//       message.success('DashBoard Name Updated Successfully!');
//       refreshDashBoards();
//     } else {
//       message.error('Failed To Update DashBoard Name.');
//     }
//     console.log('data publish', data);
//   };

//   // function to delete the dashBoard on click of Delete Icons
//   const DeleteDashBoardButton = async () => {
//     const resp = await deleteDashBoard(params.id, initialState?.currentUser?.email);
//     console.log('delete resp', resp);
//     if (resp?.status === 'success') {
//       refreshDashBoards();
//       message.success('DashBoard Deleted Successfully!');
//       navigate('/conversations/new');
//       // if(resp?.resp_obj.length > 0){
//       //   const data = resp?.resp_obj[0]
//       //   const id = data._id
//       //   console.log(id)
//       //   console.log('data', data);
//       //   navigate(`/dashboard/${id}`);
//       // }else{
//       //   navigate('/conversations/new');
//       // }
//     } else {
//       message.error('Failed to Delete DashBoard.');
//     }
//     setHidePublish(false);
//   };

//   // function to edit the Dashboard Name on click of checkout icon
//   const handleEditDashBoardButton = async () => {
//     if (newDashBoardName.trim().length > 0) {
//       console.log('newname', newDashBoardName);
//       const resp = await updateData(
//         params.id,
//         newDashBoardName,
//         null,
//         initialState?.currentUser?.email,
//       );
//       setEditOpen(false);
//       setHidePublish(true);
//       if (resp?.status === 'success') {
//         refreshDashBoards();
//         message.success('DashBoard Updated Successfully!');
//       } else {
//         message.error('Failed To Update DashBoard.');
//       }
//     } else {
//       setDashBoardInputError(true);
//     }
//   };

//   const handleAddCustomStyle = (groupId, itemId, newStyle) => {
//     const updatedData = data?.map((group) => {
//       if (group._id === groupId) {
//         return {
//           ...group,
//           items: group?.items?.map((item) => {
//             if (item._id === itemId) {
//               return {
//                 ...item,
//                 custom_style: newStyle,
//               };
//             }
//             return item;
//           }),
//         };
//       }
//       return group;
//     });
//     setHidePublish(false);
//     console.log('beforedataupdate', data);
//     setData(updatedData);
//     console.log('afterdataupdate', data);
//   };

//   const handleCustomStyle = (groupId, itemId, newStyle) => {
//     handleAddCustomStyle(groupId, itemId, newStyle);
//   };

//   // const handleJsonText = (customStyle:string) => {
//   //   try {
//   //     return JSON.parse(customStyle);
//   //   } catch (e) {
//   //     console.error('Error parsing custom_style:', e);
//   //      return message.error("Enter a valid Json")
//   //   }
//   // };
//   const handleSyncButton = async () => {
//     await fetchData(false);
//   };

//   // const handleDatePickerOk = async (groupId, itemId, agentId, selectedDates) => {
//   //   if (!selectedDates || selectedDates.length !== 2) {
//   //     message.error("Please select both a start and end date.");
//   //     return;
//   //   }

//   //   console.log("Selected Dates (Formatted):", selectedDates);

//   //   let isQueryUpdated = false;

//   //   const updatedData = data?.map((group) => {
//   //     if (group._id === groupId) {
//   //       return {
//   //         ...group,
//   //         items: group?.items?.map((item) => {
//   //           if (item._id === itemId) {
//   //             const originalSqlQuery = item.sql_query.sql_query;

//   //             if (!originalSqlQuery) {
//   //               message.error("No SQL query found for this item.");
//   //               return item;
//   //             }
//   //             // Improved query parameter validation
//   //             const originalQuery = originalSqlQuery;
//   //             const hasPeriodStart = /\bperiodStart\b/i.test(originalQuery);
//   //             const hasPeriodEnd = /\bperiodEnd\b/i.test(originalQuery);
//   //             const hasPoleTime = /\bpollTime\b/i.test(originalQuery);

//   //             // Only warn if neither parameter is present
//   //             if (!(hasPoleTime || (hasPeriodStart || hasPeriodEnd))) {
//   //               message.warning(
//   //                 "The SQL query must contain either 'pollTime' or  'periodStart' or 'periodEnd' parameters."
//   //               );
//   //               return;
//   //             }
//   //             isQueryUpdated = true;

//   //             return {
//   //               ...item,
//   //               sql_query: {
//   //                 ...item.sql_query,
//   //                 sql_query: originalSqlQuery, // Keep original query temporarily
//   //               },
//   //             };
//   //           }
//   //           return item;
//   //         }),
//   //       };
//   //     }
//   //     return group;
//   //   });

//   //   if (!isQueryUpdated) {
//   //     message.warning("No updates were made to the SQL query.");
//   //     return;
//   //   }

//   //   setHidePublish(false);
//   //   setData(updatedData); // Set temporary state with the original query

//   //   const updatedItem = updatedData
//   //     .find((group) => group._id === groupId)
//   //     ?.items.find((item) => item._id === itemId);

//   //   const payload = {
//   //     sql_query: updatedItem.sql_query.sql_query, // Send the original SQL query
//   //     agent_id: agentId,
//   //     type: "query",
//   //     start_time: selectedDates[0], // Pass the start date
//   //     end_time: selectedDates[1],   // Pass the end date
//   //   };

//   //   dateChartsetIsLoading(true); // Set loading to true before the API call
//   //   try {
//   //     const response = await updateTimestampsInQuery(payload);

//   //     if (response.status === "success") {
//   //       const { results: apiResults, sql_query: updatedSqlQuery, column_data } = response.resp_obj;

//   //       message.success(
//   //         `Selected Date Range: ${selectedDates?.[0]} to ${selectedDates?.[1]}`
//   //       );

//   //       const updatedTableData = data.map((group) => {
//   //         if (group._id === groupId) {
//   //           return {
//   //             ...group,
//   //             items: group.items.map((item) => {
//   //               if (item._id === itemId) {
//   //                 return {
//   //                   ...item,
//   //                   sql_query: {
//   //                     ...item.sql_query,
//   //                     sql_query: updatedSqlQuery, // Update with the new SQL query
//   //                   },
//   //                   table_data: apiResults,     // Set table data from API response
//   //                   columns_data: column_data,  // Update column data if needed
//   //                 };
//   //               }
//   //               return item;
//   //             }),
//   //           };
//   //         }
//   //         return group;
//   //       });

//   //       setData(updatedTableData);
//   //       setHidePublish(false);
//   //       setTimestamp(Date.now());
//   //     } else {
//   //       message.error("Failed to fetch preview data.");
//   //     }
//   //   } catch (error) {
//   //     console.error("An error occurred while fetching preview data:", error);
//   //     message.error("An error occurred while fetching preview data.");
//   //   } finally {
//   //     dateChartsetIsLoading(false); // Set loading to false after the API call completes
//   //   }
//   // };

//   const handleDatePickerOk = async (groupId, itemId, agentId, selectedDates) => {
//     if (!selectedDates || selectedDates.length !== 2) {
//       message.error("Please select both a start and end date.");
//       return;
//     }

//     console.log("Selected Dates (Formatted):", selectedDates);

//     let isQueryUpdated = false;

//     const columnsToCheck = [
//       'periodStart', 'periodEnd', 'pollTime',
//       'completedTime','CreatedTime','StartTime','EndTime', 'rosterDate', 'createdAt',
//       'closedAt', 'startTime', 'haltPeriod',
//       'responseSLATime', 'resolutionSLATime', 'slaTime',
//       'updatedTime', 'responsedTime', 'responseTime',
//       'reopenTime', 'JobCompletedTime', 'JobCreatedTime','FFM_WFPublishTemplatepublishTime',
//       'JobStartTime', 'JobEndTime', 'JobPostVerificationEndTime',
//       'JobFillStartTime', 'JobPostVerificationCompletedTime',
//       'JobPostVerificationFillStartTime', 'WfCreatedTime','Time',
//       'WfActualStartTime', 'WfActualEndTime', 'WfStartTime', 'WfEndTime',
//       'Sched_Start', 'Sched_End', 'Actual_Start', 'Actual_End', 'Created At', 'Closed At', 'Date', 'temp date'
//     ];

//     const updatedData = data?.map((group) => {
//       if (group._id === groupId) {
//         return {
//           ...group,
//           items: group?.items?.map((item) => {
//             if (item._id === itemId) {
//               const originalSqlQuery = item.sql_query.sql_query;

//               if (!originalSqlQuery) {
//                 message.error("No SQL query found for this item.");
//                 return item;
//               }
//               // Improved query parameter validation
//               const originalQuery = originalSqlQuery;
//               const hasPeriodStart = /\bperiodStart\b/i.test(originalQuery);
//               const hasPeriodEnd = /\bperiodEnd\b/i.test(originalQuery);
//               const hasPoleTime = /\bpollTime\b/i.test(originalQuery);

//               // Check if any of the new columns are in the SQL query
//               const hasNewColumns = columnsToCheck.some(col => new RegExp(`\\b${col}\\b`, 'i').test(originalQuery));

//               // Only warn if neither parameter is present
//               if (!(hasPoleTime || (hasPeriodStart || hasPeriodEnd) || hasNewColumns)) {
//                 message.warning(
//                   "The SQL query must contain time parameters."
//                 );
//                 return item;
//               }
//               isQueryUpdated = true;

//               return {
//                 ...item,
//                 sql_query: {
//                   ...item.sql_query,
//                   sql_query: originalSqlQuery, // Keep original query temporarily
//                 },
//               };
//             }
//             return item;
//           }),
//         };
//       }
//       return group;
//     });

//     if (!isQueryUpdated) {
//       message.warning("No updates were made to the SQL query.");
//       return;
//     }

//     setHidePublish(false);
//     setData(updatedData); // Set temporary state with the original query

//     const updatedItem = updatedData
//       .find((group) => group._id === groupId)
//       ?.items.find((item) => item._id === itemId);

//     const payload = {
//       sql_query: updatedItem.sql_query.sql_query, // Send the original SQL query
//       agent_id: agentId,
//       type: "query",
//       start_time: selectedDates[0], // Pass the start date
//       end_time: selectedDates[1],   // Pass the end date
//     };

//     dateChartsetIsLoading(true); // Set loading to true before the API call
//     try {
//       const response = await updateTimestampsInQuery(payload);

//       if (response.status === "success") {
//         const { results: apiResults, sql_query: updatedSqlQuery, column_data } = response.resp_obj;

//         message.success(
//           `Selected Date Range: ${selectedDates?.[0]} to ${selectedDates?.[1]}`
//         );

//         const updatedTableData = data.map((group) => {
//           if (group._id === groupId) {
//             return {
//               ...group,
//               items: group.items.map((item) => {
//                 if (item._id === itemId) {
//                   return {
//                     ...item,
//                     sql_query: {
//                       ...item.sql_query,
//                       sql_query: updatedSqlQuery, // Update with the new SQL query
//                     },
//                     table_data: apiResults,     // Set table data from API response
//                     columns_data: column_data,  // Update column data if needed
//                   };
//                 }
//                 return item;
//               }),
//             };
//           }
//           return group;
//         });

//         setData(updatedTableData);
//         setHidePublish(false);
//         setTimestamp(Date.now());
//       } else {
//         message.error("Failed to fetch preview data.");
//       }
//     } catch (error) {
//       console.error("An error occurred while fetching preview data:", error);
//       message.error("An error occurred while fetching preview data.");
//     } finally {
//       dateChartsetIsLoading(false); // Set loading to false after the API call completes
//     }
//   };

//   return (
//     <PageContainer
//       title={
//         !editOpen ? (
//           newDashBoardName
//         ) : (
//           <Input
//             // placeholder="Enter New DashBoard Name"
//             status={dashBoardInputError ? 'error' : ''}
//             placeholder={dashBoardInputError ? 'Field Can Not Be Empty' : ''}
//             suffix={[
//               <Button
//                 key={'1'}
//                 type="text"
//                 icon={<CheckOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
//                 onClick={handleEditDashBoardButton}
//               />,
//               <Button
//                 key={'2'}
//                 type="text"
//                 icon={
//                   <CloseOutlined
//                     style={{ color: 'rgba(0,0,0,.45)' }}
//                     onClick={() => {
//                       setEditOpen(false);
//                       setDashBoardInputError(false);
//                       setNewDashBoardName(originalDashBoardName);
//                     }}
//                   />
//                 }
//               />,
//             ]}
//             value={newDashBoardName}
//             onChange={(e) => setNewDashBoardName(e.target.value)}
//           />
//         )
//       }
//       extra={[
//         !hidePublish && (
//           <Button
//             key={'1'}
//             loading={loadPublish}
//             type="primary"
//             icon={<PushpinOutlined />}
//             onClick={handlePublishButton}
//           >
//             Publish
//           </Button>
//         ),
//         <Button
//           key={'2'}
//           loading={syncing}
//           type="text"
//           icon={<SyncOutlined />}
//           onClick={handleSyncButton}
//         >
//           {syncing ? 'Syncing...' : 'Sync Now'}
//         </Button>,
//         <Button key={'3'} icon={<EditOutlined />} onClick={() => setEditOpen(true)} />,
//         <Popconfirm
//           key={'4'}
//           placement="bottomRight"
//           title="Delete DashBoard"
//           description="Are you sure you want to delete this DashBoard?"
//           onConfirm={DeleteDashBoardButton}
//           // onCancel={cancel}
//           okText="Yes"
//           cancelText="No"
//         >
//           <Button key={'5'} danger icon={<DeleteOutlined />} />
//         </Popconfirm>,
//       ]}
//     >
//       {loading ? (
//         <>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Skeleton active />
//             </Col>
//             <Col span={12}>
//               <Skeleton active />
//             </Col>
//           </Row>
//           <Space size={'large'} />
//           <Row gutter={16}>
//             <Col span={12}>
//               <Skeleton active />
//             </Col>
//             <Col span={12}>
//               <Skeleton active />
//             </Col>
//           </Row>
//         </>
//       ) : (
//         <DragDropContext onDragEnd={onDragEnd}>
//           {data &&
//             data?.map((group) => (
//               <div
//                 key={group._id}
//                 style={{
//                   border: group.items.length < 1 ? '1px solid #ccc' : 'none',
//                   padding: group.items.length < 1 ? '10px' : '0px',
//                   marginBottom: '15px',
//                   borderRadius: '8px',
//                 }}
//               >
//                 <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
//                   <Flex align="center">
//                     {/* <Title level={5}>{group.group_name}</Title> */}
//                     {openInputField && selectedGroupId === group._id ? (
//                       <Input
//                         placeholder="Enter your username"
//                         suffix={[
//                           <Button
//                             key={'1'}
//                             type="text"
//                             icon={<CheckOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
//                             onClick={handleGroupNameSubmit}
//                           />,
//                           <Button
//                             key={'2'}
//                             type="text"
//                             icon={
//                               <CloseOutlined
//                                 style={{ color: 'rgba(0,0,0,.45)' }}
//                                 onClick={hideEditGroupName}
//                               />
//                             }
//                           />,
//                         ]}
//                         value={newGroupTitle}
//                         onChange={(e) => setNewGroupTitle(e.target.value)}
//                       />
//                     ) : (
//                       <Title level={5}>{group.group_name}</Title>
//                     )}
//                   </Flex>
//                   <div style={{ marginRight: group.items.length < 1 ? '0px' : '8px' }}>
//                     <Dropdown menu={menuProps(group._id)} trigger={['click']}>
//                       <UnorderedListOutlined />
//                     </Dropdown>
//                   </div>
//                 </Flex>
//                 <Droppable key={group._id} droppableId={group._id} direction="horizontal">
//                   {(provided) => (
//                     <Row gutter={12} ref={provided.innerRef} {...provided.droppableProps}>
//                       {group?.items?.map((item, index) => (
//                         <Draggable key={item._id} draggableId={item._id} index={index}>
//                           {(provided) => (
//                             <Col
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               span={24 / group.items.length}
//                             >
//                               {data && (
//                                 <ChatVisualizationCard
//                                   key={timestamp}
//                                   description={item.description}
//                                   setHidePublish={setHidePublish}
//                                   // item_data={item.item_data}
//                                   item_data={{
//                                     chart_rec: item.chart_rec,
//                                     table_data: item.table_data, //results
//                                     ds_name: item.ds_name,
//                                     sql_query: item.sql_query.sql_query,
//                                     updatedTableDataAfterDate: results,
//                                   }}
//                                   columnsData={item.columns_data}
//                                   DashBoardView={true}
//                                   groupId={group._id}
//                                   itemId={item._id}
//                                   agentId={item.agent_id}
//                                   handleDelete={() => handleDelete(group._id, item._id)}
//                                   handleItemDescription={handleItemDescription}
//                                   handleCustomStyle={handleCustomStyle}
//                                   customStyle={typeof item?.custom_style === 'string' &&
//                                     item?.custom_style !== 'None'
//                                     ? JSON.parse(item.custom_style)
//                                     : item?.custom_style} setSideBarConfig={undefined} schemaName={undefined} convId={undefined}
//                                   handleDatePickerOk={handleDatePickerOk}
//                                   dateChartisLoading={dateChartisLoading}
//                                 />
//                               )}
//                             </Col>
//                           )}
//                         </Draggable>
//                       ))}
//                       {provided.placeholder}
//                     </Row>
//                   )}
//                 </Droppable>
//                 {group.items.length < 1 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
//               </div>
//             ))}
//         </DragDropContext>
//       )}
//     </PageContainer>
//   );
// }

// export default DashContent;
import { deleteDashBoard, getDashBoard, testPreview, updateData, updateTimestampsInQuery } from '@/services/ant-design-pro/api';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PushpinOutlined,
  SyncOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useModel, useNavigate, useParams } from '@umijs/max';
import type { MenuProps } from 'antd';
import {
  Button,
  Col,
  Dropdown,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import ChatVisualizationCard from '../Chat/ChatVisualizationCard';
const { Title } = Typography;

function DashContent() {
  const [data, setData] = useState<any[]>([]);
  const [openInputField, setOpenInputField] = useState(false); // for GroupTitle modal
  const [selectedGroupId, setSelectedGroupId] = useState(null); // State to store the selected groupId
  const [newGroupTitle, setNewGroupTitle] = useState(''); //state to change of input field for groupTitle
  const [editOpen, setEditOpen] = useState(false); //modal for upated
  const [originalDashBoardName, setOriginalDashBoardName] = useState(''); // to keep track of original dashBoard name
  const [newDashBoardName, setNewDashBoardName] = useState(''); // to edit DashBoard Name
  const navigate = useNavigate();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [hidePublish, setHidePublish] = useState<boolean>(true); //to hide Publish Button
  const [loading, setLoading] = useState(true); // to show Skeleton
  const [syncing, setSyncing] = useState(true); // to show Skeleton
  const [loadPublish, setLoadPublish] = useState(false);
  const [dashBoardInputError, setDashBoardInputError] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [results, setResults] = useState();
  const controller = new AbortController();
  const signal = controller.signal;
  const [dateChartisLoading, dateChartsetIsLoading] = useState(false); // Loading state for DashBoardChart

  console.log('syncing', syncing);

  const params: any = useParams();

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
  ];

  // function for refershing DashBorads
  const refreshDashBoards = async () => {
    const resp = await getDashBoard(null, initialState?.currentUser?.email);
    setInitialState((s: any) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        dashBoardMenuData: resp?.resp_obj
          ? resp?.resp_obj
          : initialState?.currentUser?.dashBoardMenuData,
      },
    }));
  };

  // Function to fetch data from the API
  //   const fetchData = async (cache_data: boolean = true) => {
  //   try {
  //     // setLoading(true);
  //     if (cache_data === false) setSyncing(true);
  //       const resp = await getDashBoard(params.id, initialState?.currentUser?.email, cache_data); // Call the API
  //       console.log('Data fetched', resp);
  //       if (cache_data === false) setSyncing(false);
  //       setData(resp?.resp_obj?.groups); // Set the response data to the data state
  //       setLoading(false);
  //       setHidePublish(true);
  //       setOriginalDashBoardName(resp?.resp_obj?.name);
  //       setNewDashBoardName(resp?.resp_obj?.name);
  //   } catch (error) {
  //     console.error('Error fetching dashboard data:', error);
  //     setLoading(false);
  //   }
  // };

  const fetchData = async (cache_data: boolean = true) => {
    try {
      // setLoading(true);
      if (cache_data === false) setSyncing(true);
      // const api = await fetch('http://52.146.95.100:81/dashboards/fetch', {
      //   method: 'POST',
      //   signal: signal,
      //   headers: {
      //     Accept: 'application/json',
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     dashboard_id: params.id,
      //     user_id: initialState?.currentUser?.email,
      //     cache_data: cache_data,
      //   }),
      // });
      const api = await getDashBoard(
        params.id,
        initialState?.currentUser?.email,
        cache_data,
        signal,
      );
      console.log('Data fetched', api);
      // const resp = await api.json();
      const resp = api;
      console.log('resp data', resp);
      if (cache_data === false) setSyncing(false);
      setData(resp?.resp_obj?.groups); // Set the response data to the data state
      setLoading(false);
      setHidePublish(true);
      setOriginalDashBoardName(resp?.resp_obj?.name);
      setNewDashBoardName(resp?.resp_obj?.name);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const performSync = async () => {
      await fetchData(); // First fetch
      await fetchData(false); // Second fetch
      setTimestamp(Date.now());
    };
    performSync();
    refreshDashBoards();
    return () => {
      console.log('Aborting previous fetch...');
      controller.abort();
    };
  }, [params]);

  // function to open inputfield to edit  GroupName
  const openEditGroupName = (groupId) => {
    //  and also get groupId and get groupTitle of that id
    setSelectedGroupId(groupId);
    setOpenInputField(true);
    const group = data.find((group) => group._id === groupId);
    if (group) {
      setNewGroupTitle(group.group_name);
    }
  };

  //function to hide inputField for Group Name
  const hideEditGroupName = () => {
    setOpenInputField(false);
  };

  //function to delete individual groups and items
  const handleDelete = (groupId, itemId = null) => {
    // If itemId is null, it means the delete operation is for the entire group
    if (itemId === null) {
      const updatedData = data.filter((group) => group._id !== groupId);
      setData(updatedData);
      setHidePublish(false);
      setTimestamp(Date.now());
    } else {
      // Implement deletion logic here for individual items
      const updatedData = data?.map((group) => {
        if (group._id === groupId) {
          return {
            ...group,
            items: group.items.filter((item) => item._id !== itemId),
          };
        }
        return group;
      });
      setData(updatedData);
      setHidePublish(false);
      setTimestamp(Date.now());
    }
  };

  //actually function to edit the groupName and ItemDescription
  const handleEdit = (
    groupId = null,
    editedTitle = null,
    itemId = null,
    editedDescription = null,
  ) => {
    // Find the group by groupId
    const updatedData = data?.map((group) => {
      if (group._id === groupId) {
        // If itemId is provided, update item description
        if (itemId) {
          return {
            ...group,
            items: group?.items?.map((item) => {
              if (item._id === itemId) {
                return {
                  ...item,
                  description: editedDescription,
                };
              }
              return item;
            }),
          };
        }
        // If editedTitle is provided, update group title
        if (editedTitle) {
          return {
            ...group,
            group_name: editedTitle,
          };
        }
      }
      return group;
    });
    setData(updatedData); //save the cahanges to the API data
    setHidePublish(false);
  };

  // function to submit the NewgroupName
  const handleGroupNameSubmit = () => {
    if (!selectedGroupId) return;
    handleEdit(selectedGroupId, newGroupTitle); //function to edit groupTitle
    setOpenInputField(false);
  };

  //below is the function for ChatVisualizationCard to edit ItemTitle and save the changes to the Api data
  const handleItemDescription = (editedDescription: string, groupId: string, itemId: string) => {
    handleEdit(groupId, null, itemId, editedDescription);
  };

  // menu Data onclick functions
  const handleMenuClick: MenuProps['onClick'] = (e: any, groupId: string) => {
    if (e.key === '1') {
      handleDelete(groupId);
    }
    if (e.key === '2') {
      openEditGroupName(groupId);
    }
    //  else {
    //   console.log('click', e);
    // }
  };

  const menuProps = (groupId: string) => ({
    items,
    onClick: (e: any) => handleMenuClick(e, groupId),
  });

  //function for  reordering items when drag and drop occurs
  function reorderItems(source: any, destination: any, data: any) {
    console.log('reorder', data);
    const sourceGroup = data.find((group) => group._id === source.droppableId);
    const destinationGroup = data.find((group) => group._id === destination.droppableId);
    // const sourceIndex = sourceGroup.items.findIndex((item) => item._id === source.draggableId);
    // const destinationIndex = destinationGroup.items.findIndex(
    //   (item) => item._id === destination.draggableId,
    // );
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    if (source.droppableId === destination.droppableId && sourceIndex === destinationIndex) {
      setHidePublish(true);
      return data; // Return the original data as no reordering is needed
    }

    const updatedData = [...data];

    if (source.droppableId !== destination.droppableId) {
      const [removedItem] = sourceGroup.items.splice(sourceIndex, 1);
      destinationGroup.items.splice(destinationIndex, 0, removedItem);
      setHidePublish(false);
    } else {
      const [reorderedItem] = sourceGroup.items.splice(sourceIndex, 1);
      sourceGroup.items.splice(destinationIndex, 0, reorderedItem);
      setHidePublish(false);
    }
    return updatedData;
  }

  //function for drag operations
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    setTimestamp(Date.now());
    console.log('drag_operation', result);
    // calling the reorderItem()
    const updatedData = reorderItems(result.source, result.destination, data);
    setData(updatedData); //after reordering save the  data to API
  };

  // function to save the changes on click of Publish Button
  const handlePublishButton = async () => {
    setLoadPublish(true);
    const resp = await updateData(params.id, null, data, initialState?.currentUser?.email);
    setLoadPublish(false);
    setHidePublish(true);
    if (resp.status === 'success') {
      message.success('DashBoard Name Updated Successfully!');
      refreshDashBoards();
    } else {
      message.error('Failed To Update DashBoard Name.');
    }
    console.log('data publish', data);
  };

  // function to delete the dashBoard on click of Delete Icons
  const DeleteDashBoardButton = async () => {
    const resp = await deleteDashBoard(params.id, initialState?.currentUser?.email);
    console.log('delete resp', resp);
    if (resp?.status === 'success') {
      refreshDashBoards();
      message.success('DashBoard Deleted Successfully!');
      navigate('/conversations/new');
      // if(resp?.resp_obj.length > 0){
      //   const data = resp?.resp_obj[0]
      //   const id = data._id
      //   console.log(id)
      //   console.log('data', data);
      //   navigate(`/dashboard/${id}`);
      // }else{
      //   navigate('/conversations/new');
      // }
    } else {
      message.error('Failed to Delete DashBoard.');
    }
    setHidePublish(false);
  };

  // function to edit the Dashboard Name on click of checkout icon
  const handleEditDashBoardButton = async () => {
    if (newDashBoardName.trim().length > 0) {
      console.log('newname', newDashBoardName);
      const resp = await updateData(
        params.id,
        newDashBoardName,
        null,
        initialState?.currentUser?.email,
      );
      setEditOpen(false);
      setHidePublish(true);
      if (resp?.status === 'success') {
        refreshDashBoards();
        message.success('DashBoard Updated Successfully!');
      } else {
        message.error('Failed To Update DashBoard.');
      }
    } else {
      setDashBoardInputError(true);
    }
  };

  const handleAddCustomStyle = (groupId, itemId, newStyle) => {
    const updatedData = data?.map((group) => {
      if (group._id === groupId) {
        return {
          ...group,
          items: group?.items?.map((item) => {
            if (item._id === itemId) {
              return {
                ...item,
                custom_style: newStyle,
              };
            }
            return item;
          }),
        };
      }
      return group;
    });
    setHidePublish(false);
    console.log('beforedataupdate', data);
    setData(updatedData);
    console.log('afterdataupdate', data);
  };

  const handleCustomStyle = (groupId, itemId, newStyle) => {
    handleAddCustomStyle(groupId, itemId, newStyle);
  };

  // const handleJsonText = (customStyle:string) => {
  //   try {
  //     return JSON.parse(customStyle);
  //   } catch (e) {
  //     console.error('Error parsing custom_style:', e);
  //      return message.error("Enter a valid Json")
  //   }
  // };
  const handleSyncButton = async () => {
    await fetchData(false);
    setTimestamp(Date.now());
  };

  // const handleDatePickerOk = async (groupId, itemId, agentId, selectedDates) => {
  //   if (!selectedDates || selectedDates.length !== 2) {
  //     message.error("Please select both a start and end date.");
  //     return;
  //   }

  //   console.log("Selected Dates (Formatted):", selectedDates);

  //   let isQueryUpdated = false;

  //   const updatedData = data?.map((group) => {
  //     if (group._id === groupId) {
  //       return {
  //         ...group,
  //         items: group?.items?.map((item) => {
  //           if (item._id === itemId) {
  //             const originalSqlQuery = item.sql_query.sql_query;

  //             if (!originalSqlQuery) {
  //               message.error("No SQL query found for this item.");
  //               return item;
  //             }
  //             // Improved query parameter validation
  //             const originalQuery = originalSqlQuery;
  //             const hasPeriodStart = /\bperiodStart\b/i.test(originalQuery);
  //             const hasPeriodEnd = /\bperiodEnd\b/i.test(originalQuery);
  //             const hasPoleTime = /\bpollTime\b/i.test(originalQuery);

  //             // Only warn if neither parameter is present
  //             if (!(hasPoleTime || (hasPeriodStart || hasPeriodEnd))) {
  //               message.warning(
  //                 "The SQL query must contain either 'pollTime' or  'periodStart' or 'periodEnd' parameters."
  //               );
  //               return;
  //             }
  //             isQueryUpdated = true;

  //             return {
  //               ...item,
  //               sql_query: {
  //                 ...item.sql_query,
  //                 sql_query: originalSqlQuery, // Keep original query temporarily
  //               },
  //             };
  //           }
  //           return item;
  //         }),
  //       };
  //     }
  //     return group;
  //   });

  //   if (!isQueryUpdated) {
  //     message.warning("No updates were made to the SQL query.");
  //     return;
  //   }

  //   setHidePublish(false);
  //   setData(updatedData); // Set temporary state with the original query

  //   const updatedItem = updatedData
  //     .find((group) => group._id === groupId)
  //     ?.items.find((item) => item._id === itemId);

  //   const payload = {
  //     sql_query: updatedItem.sql_query.sql_query, // Send the original SQL query
  //     agent_id: agentId,
  //     type: "query",
  //     start_time: selectedDates[0], // Pass the start date
  //     end_time: selectedDates[1],   // Pass the end date
  //   };

  //   dateChartsetIsLoading(true); // Set loading to true before the API call
  //   try {
  //     const response = await updateTimestampsInQuery(payload);

  //     if (response.status === "success") {
  //       const { results: apiResults, sql_query: updatedSqlQuery, column_data } = response.resp_obj;

  //       message.success(
  //         `Selected Date Range: ${selectedDates?.[0]} to ${selectedDates?.[1]}`
  //       );

  //       const updatedTableData = data.map((group) => {
  //         if (group._id === groupId) {
  //           return {
  //             ...group,
  //             items: group.items.map((item) => {
  //               if (item._id === itemId) {
  //                 return {
  //                   ...item,
  //                   sql_query: {
  //                     ...item.sql_query,
  //                     sql_query: updatedSqlQuery, // Update with the new SQL query
  //                   },
  //                   table_data: apiResults,     // Set table data from API response
  //                   columns_data: column_data,  // Update column data if needed
  //                 };
  //               }
  //               return item;
  //             }),
  //           };
  //         }
  //         return group;
  //       });

  //       setData(updatedTableData);
  //       setHidePublish(false);
  //       setTimestamp(Date.now());
  //     } else {
  //       message.error("Failed to fetch preview data.");
  //     }
  //   } catch (error) {
  //     console.error("An error occurred while fetching preview data:", error);
  //     message.error("An error occurred while fetching preview data.");
  //   } finally {
  //     dateChartsetIsLoading(false); // Set loading to false after the API call completes
  //   }
  // };

  const handleDatePickerOk = async (groupId, itemId, agentId, selectedDates) => {
    if (!selectedDates || selectedDates.length !== 2) {
      message.error("Please select both a start and end date.");
      return;
    }

    console.log("Selected Dates (Formatted):", selectedDates);

    let isQueryUpdated = false;

    const columnsToCheck = [
      'periodStart', 'periodEnd', 'pollTime',
      'completedTime','CreatedTime','StartTime','EndTime', 'rosterDate', 'createdAt',
      'closedAt', 'startTime', 'haltPeriod',
      'responseSLATime', 'resolutionSLATime', 'slaTime',
      'updatedTime', 'responsedTime', 'responseTime',
      'reopenTime', 'JobCompletedTime', 'JobCreatedTime','FFM_WFPublishTemplatepublishTime',
      'JobStartTime', 'JobEndTime', 'JobPostVerificationEndTime',
      'JobFillStartTime', 'JobPostVerificationCompletedTime',
      'JobPostVerificationFillStartTime', 'WfCreatedTime','occupancyTime',
      'WfActualStartTime', 'WfActualEndTime', 'WfStartTime', 'WfEndTime',
      'Sched_Start', 'Sched_End', 'Actual_Start', 'Actual_End', 'Created At', 'Closed At', 'Date', 'temp date'
    ];

    const updatedData = data?.map((group) => {
      if (group._id === groupId) {
        return {
          ...group,
          items: group?.items?.map((item) => {
            if (item._id === itemId) {
              const originalSqlQuery = item.sql_query.sql_query;

              if (!originalSqlQuery) {
                message.error("No SQL query found for this item.");
                return item;
              }
              // Improved query parameter validation
              const originalQuery = originalSqlQuery;
              const hasPeriodStart = /\bperiodStart\b/i.test(originalQuery);
              const hasPeriodEnd = /\bperiodEnd\b/i.test(originalQuery);
              const hasPoleTime = /\bpollTime\b/i.test(originalQuery);

              // Check if any of the new columns are in the SQL query
              const hasNewColumns = columnsToCheck.some(col => new RegExp(`\\b${col}\\b`, 'i').test(originalQuery));

              // Only warn if neither parameter is present
              if (!(hasPoleTime || (hasPeriodStart || hasPeriodEnd) || hasNewColumns)) {
                message.warning(
                  "The SQL query must contain time parameters."
                );
                return item;
              }
              isQueryUpdated = true;

              return {
                ...item,
                sql_query: {
                  ...item.sql_query,
                  sql_query: originalSqlQuery, // Keep original query temporarily
                },
              };
            }
            return item;
          }),
        };
      }
      return group;
    });

    if (!isQueryUpdated) {
      message.warning("No updates were made to the SQL query.");
      return;
    }

    setHidePublish(false);
    setData(updatedData); // Set temporary state with the original query

    const updatedItem = updatedData
      .find((group) => group._id === groupId)
      ?.items.find((item) => item._id === itemId);

    const payload = {
      sql_query: updatedItem.sql_query.sql_query, // Send the original SQL query
      agent_id: agentId,
      type: "query",
      start_time: selectedDates[0], // Pass the start date
      end_time: selectedDates[1],   // Pass the end date
    };

    dateChartsetIsLoading(true); // Set loading to true before the API call
    try {
      const response = await updateTimestampsInQuery(payload);

      if (response.status === "success") {
        const { results: apiResults, sql_query: updatedSqlQuery, column_data } = response.resp_obj;

        message.success(
          `Selected Date Range: ${selectedDates?.[0]} to ${selectedDates?.[1]}`
        );

        const dates = selectedDates;

        const updatedTableData = data.map((group) => {
          if (group._id === groupId) {
            return {
              ...group,
              items: group.items.map((item) => {
                if (item._id === itemId) {
                  return {
                    ...item,
                    sql_query: {
                      ...item.sql_query,
                      sql_query: updatedSqlQuery, // Update with the new SQL query
                    },
                    table_data: apiResults,     // Set table data from API response
                    columns_data: column_data,
                    selected_date:dates ? dates : null  // Update column data if needed
                  };
                }
                return item;
              }),
            };
          }
          return group;
        });

        setData(updatedTableData);
        setHidePublish(false);
        setTimestamp(Date.now());
      } else {
        message.error("Failed to fetch preview data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching preview data:", error);
      message.error("An error occurred while fetching preview data.");
    } finally {
      dateChartsetIsLoading(false); // Set loading to false after the API call completes
    }
  };

  useEffect(()=>{
    console.log('67we57753437', data);
  },[data])

  return (
    <PageContainer
      title={
        !editOpen ? (
          newDashBoardName
        ) : (
          <Input
            // placeholder="Enter New DashBoard Name"
            status={dashBoardInputError ? 'error' : ''}
            placeholder={dashBoardInputError ? 'Field Can Not Be Empty' : ''}
            suffix={[
              <Button
                key={'1'}
                type="text"
                icon={<CheckOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                onClick={handleEditDashBoardButton}
              />,
              <Button
                key={'2'}
                type="text"
                icon={
                  <CloseOutlined
                    style={{ color: 'rgba(0,0,0,.45)' }}
                    onClick={() => {
                      setEditOpen(false);
                      setDashBoardInputError(false);
                      setNewDashBoardName(originalDashBoardName);
                    }}
                  />
                }
              />,
            ]}
            value={newDashBoardName}
            onChange={(e) => setNewDashBoardName(e.target.value)}
          />
        )
      }
      extra={[
        !hidePublish && (
          <Button
            key={'1'}
            loading={loadPublish}
            type="primary"
            icon={<PushpinOutlined />}
            onClick={handlePublishButton}
          >
            Publish
          </Button>
        ),
        <Button
          key={'2'}
          loading={syncing}
          type="text"
          icon={<SyncOutlined />}
          onClick={handleSyncButton}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>,
        <Button key={'3'} icon={<EditOutlined />} onClick={() => setEditOpen(true)} />,
        <Popconfirm
          key={'4'}
          placement="bottomRight"
          title="Delete DashBoard"
          description="Are you sure you want to delete this DashBoard?"
          onConfirm={DeleteDashBoardButton}
          // onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button key={'5'} danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ]}
    >
      {loading ? (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Skeleton active />
            </Col>
            <Col span={12}>
              <Skeleton active />
            </Col>
          </Row>
          <Space size={'large'} />
          <Row gutter={16}>
            <Col span={12}>
              <Skeleton active />
            </Col>
            <Col span={12}>
              <Skeleton active />
            </Col>
          </Row>
        </>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {data &&
            data?.map((group) => (
              <div
                key={group._id}
                style={{
                  border: group.items.length < 1 ? '1px solid #ccc' : 'none',
                  padding: group.items.length < 1 ? '10px' : '0px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                }}
              >
                <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
                  <Flex align="center">
                    {/* <Title level={5}>{group.group_name}</Title> */}
                    {openInputField && selectedGroupId === group._id ? (
                      <Input
                        placeholder="Enter your username"
                        suffix={[
                          <Button
                            key={'1'}
                            type="text"
                            icon={<CheckOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                            onClick={handleGroupNameSubmit}
                          />,
                          <Button
                            key={'2'}
                            type="text"
                            icon={
                              <CloseOutlined
                                style={{ color: 'rgba(0,0,0,.45)' }}
                                onClick={hideEditGroupName}
                              />
                            }
                          />,
                        ]}
                        value={newGroupTitle}
                        onChange={(e) => setNewGroupTitle(e.target.value)}
                      />
                    ) : (
                      <Title level={5}>{group.group_name}</Title>
                    )}
                  </Flex>
                  <div style={{ marginRight: group.items.length < 1 ? '0px' : '8px' }}>
                    <Dropdown menu={menuProps(group._id)} trigger={['click']}>
                      <UnorderedListOutlined />
                    </Dropdown>
                  </div>
                </Flex>
                <Droppable key={group._id} droppableId={group._id} direction="horizontal">
                  {(provided) => (
                    <Row gutter={12} ref={provided.innerRef} {...provided.droppableProps}>
                      {group?.items?.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided) => (
                            <Col
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              span={24 / group.items.length}
                            >
                              {data && (
                                <ChatVisualizationCard
                                  key={timestamp}
                                  description={item.description}
                                  setHidePublish={setHidePublish}
                                  // item_data={item.item_data}
                                  item_data={{
                                    chart_rec: item.chart_rec,
                                    table_data: item.table_data, //results
                                    ds_name: item.ds_name,
                                    sql_query: item.sql_query.sql_query,
                                    updatedTableDataAfterDate: results,
                                    selected_date:item?.selected_date,
                                  }}
                                  columnsData={item.columns_data}
                                  DashBoardView={true}
                                  groupId={group._id}
                                  itemId={item._id}
                                  agentId={item.agent_id}
                                  handleDelete={() => handleDelete(group._id, item._id)}
                                  handleItemDescription={handleItemDescription}
                                  handleCustomStyle={handleCustomStyle}
                                  customStyle={typeof item?.custom_style === 'string' &&
                                    item?.custom_style !== 'None'
                                    ? JSON.parse(item.custom_style)
                                    : item?.custom_style} setSideBarConfig={undefined} schemaName={undefined} convId={undefined}
                                  handleDatePickerOk={handleDatePickerOk}
                                  dateChartisLoading={dateChartisLoading}
                                />
                              )}
                            </Col>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Row>
                  )}
                </Droppable>
                {group.items.length < 1 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              </div>
            ))}
        </DragDropContext>
      )}
    </PageContainer>
  );
}

export default DashContent;
