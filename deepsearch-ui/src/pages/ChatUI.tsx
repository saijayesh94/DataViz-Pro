import {
  UpdateConversationTitle,
  chat,
  deleteConversation,
  getAllAgents,
  getConversations,
  saveFewShot,
} from '@/services/ant-design-pro/api';
import {
  DeleteFilled,
  EditFilled,
  RollbackOutlined,
  SaveFilled,
  SyncOutlined,
  WechatWorkOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useModel, useNavigate, useParams } from '@umijs/max';
import {
  Button,
  Col,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Tooltip,
  message,
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import ChatConfigCard from '../components/Chat/ChatConfigCard';
import ChatMessageItem from '../components/Chat/ChatMessageItem';
import SearchBar from '../components/Chat/SearchBar';

// interface ChatUIProps {
//   // data: { role: string; content: string; table_data?: any[]; }[];
// }

const useStyles = createStyles(() => {
  return {
    scrollContainer: {
      overflow: 'auto', // Enable scrolling
      scrollbarWidth: 'none', // Hide standard scrollbar in Firefox
      '&::-webkit-scrollbar': {
        width: 0, // Hide scrollbar for webkit-based browsers like Chrome and Safari
      },
    },
  };
});

const ChatUI: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles(); // Apply styles
  const params: any = useParams();
  const [conv, setConv] = useState<any>([]);
  const [allAgents, setAllAgents] = useState<any[]>([]); // Ensure allAgents is an array
  const [convId, setConvId] = useState('');
  const [columnsData, setColumnsData] = useState({});
  const [sideBarConfig, setSideBarConfig] = useState(null);
  const navigate = useNavigate();
  // const [messageApi, contextHolder] = message.useMessage();
  const [convTitle, setconvTitle] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  // const [allSchemas, setAllSchemas] = useState([]);
  // const [schemaName, setSchemaName] = useState(null);
  const [agentid, setagentid] = useState(null);
  const [selfLearnStatus, setSelfLearnStatus] = useState(false);
  const [promtIndices, setPromptIndices] = useState([]);
  const [disabledSearch, SetDisableSearch] = useState(false);
  const [syncLoad, setSyncLoad] = useState(false);
  const [disableAgentCount, setDisableAgentCount] = useState(0);

  console.log('PARAMS', params);
  console.log('Initial State', initialState);

  // const initialChartConfig = {
  //     chart_type: 'Bar',
  //     xField: 'UserName',
  //     yField: 'Logged Hours in Hours',
  //     category: 'UserName',
  //     view: 'chart',
  //   };

  const refreshConversations = async () => {
    const resp = await getConversations('', initialState?.currentUser?.email);
    setInitialState((s: any) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        conversationMenuData: resp?.resp_obj
          ? resp?.resp_obj
          : initialState?.currentUser?.conversationMenuData,
      },
    }));
  };

  //here we are getting  the search details
  //did not get how we are getting the conId and saving in convId
  const onMessageSend = async (message: any) => {
    const payload = {
      conversation_id: convId || '',
      conversation: [...conv, { role: 'user', content: message }],
      model_name: modelName,
      //ds_name: schemaName,
      agent_id: agentid,
      column_data: columnsData || {},
    };
    SetDisableSearch(true);
    setConv([...conv, { role: 'user', content: message }, { role: 'loading', content: '' }]);
    console.log('Is Loading seting', conv);
    setDisableAgentCount((pre) => pre + 1);
    try {
      const data = await chat(payload, initialState?.currentUser?.email); //here we are sending data to api
      console.log('in chatui data sending ', data);
      setConvId(data?.resp_obj?.conversation_id);
      setTimeout(() => {
        // If conversation data exists in the API response
        if (data?.status === 'success' && data?.resp_obj?.conversation) {
          setConv(data?.resp_obj?.conversation); //set the conversation
          setConvId(data?.resp_obj?.conversation_id);
          setconvTitle(data?.resp_obj?.title);
          console.log('API COLUMN DATA', data?.resp_obj);
          setColumnsData(data?.resp_obj?.column_data); //set column data
          console.log('columdata', columnsData);
          if (params.new === 'new') {
            refreshConversations();
            //  const id = data.resp_obj?.conversation_id;
            //  console.log('id',id)
            // navigate(`/conversations/${data.resp_obj?.conversation_id}`);
            // navigate(`../${data.resp_obj?.conversation_id}`,{replace:true});
            // forceUpdate()
            // navigate(0);
            // history.push(`/conversations/${data.resp_obj?.conversation_id}`)
            // fetchData();
            // window.location.href = `/conversations/${data.resp_obj?.conversation_id}`
            // const conversationId = initialState?.currentUser?.conversationMenuData[initialState.currentUser.conversationMenuData.length - 1]['_id'];
            // console.log('initial stste  a a ', initialState)
            // console.log('converId',conversationId)
            // navigate(`/conversations/${conversationId}`);
          }
        } else {
          setConv(conv.slice(0, conv.length - 1));
          setDisableAgentCount(0);
          setConvId('');
        }
        SetDisableSearch(false);
      }, 2500);
    } catch (error) {
      console.error('Error sending message:', error);
      setConv(conv.slice(0, conv.length - 1)); // Remove the 'loading' message
      SetDisableSearch(false); // Enable search in case of an error
      setDisableAgentCount(0);
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      const data = await getAllAgents();
      setAllAgents(data?.resp_obj?.agents);
      if (params.new === 'new') {
        const firstAgentId = data?.resp_obj?.agents[0]?._id;
        setagentid(firstAgentId);
        setModelName('gemini-1.5-flash');
        // const agentid = localStorage.getItem('Agent');
        // const LLM = localStorage.getItem('LLM');
        // console.log('local agent', agentid, typeof agentid);
        // setagentid(agentid || firstAgentId);
        // setModelName(LLM || 'gemini-1.5-flash');
      }
    };
    fetchAgents();
  }, []);

  const fetchData = async (cache_data: boolean = true) => {
    if (params.new !== 'new') {
      //check if the parameter is not new in url
      setConvId(params.new); //if not  then set the conversation ID to the parameter value
      setLoading(true);
      const data = await getConversations(params.new, initialState?.currentUser?.email, cache_data); //get the conversation data of the particular route (param)
      setLoading(false);
      console.log('CONV:', data);
      setConv(data?.resp_obj?.conversation); //Update the conversation state
      setColumnsData(data?.resp_obj?.column_data); //Update the column state
      setconvTitle(data?.resp_obj?.title);
      //setSchemaName(data.resp_obj?.ds_name);
      setagentid(data?.resp_obj?.agent_id);
      return;
    } else {
      setConv([]);
      setConvId('');
      setconvTitle('');
      setColumnsData({});
      //setSchemaName(allSchemas[0]?.ds_name)
      setagentid(allAgents[0]?._id);
      setModelName('gemini-1.5-flash');
      // const agentid = localStorage.getItem('Agent');
      // const LLM = localStorage.getItem('LLM');
      // console.log('local agent', agentid, typeof agentid);
      // setagentid(agentid || allAgents[0]?._id);
      // setModelName(LLM || 'gemini-1.5-flash');
      setDisableAgentCount(0);
    }
  };

  useEffect(() => {
    setSelfLearnStatus(false);
    setPromptIndices([]);
    fetchData();
    refreshConversations();
    setSideBarConfig(null);
  }, [params]);

  // const success = () => {
  //   messageApi.open({
  //     type: 'success',
  //     content: 'Conversations Successfully Saved!',
  //   });
  // };

  // const error = () => {
  //   messageApi.open({
  //     type: 'error',
  //     content: 'Unable to Save Conversations!',
  //   });
  // };

  const onDeleteConfirm = async () => {
    const resp = await deleteConversation(convId);
    navigate('/conversations/new');
    if (resp?.status === 'success') {
      message.success('Conversation Deleted Successfully');
    } else {
      message.error('Failed to Delete Conversations');
    }
  };

  const showModal = () => {
    setOpen(true);
  };

  const hideModal = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (convTitle.trim().length < 2) {
      message.error('Conversation title must be at least 2 characters long.');
      return; // Exit the function if validation fails
    }
    try {
      // Create payload with updated title
      const payload = {
        conversation_id: convId, // Include conversation ID
        title: convTitle, // Include updated title
      };

      // Call chat function to update conversation title
      const response = await UpdateConversationTitle(payload);

      // Handle success message
      if (response?.status === 'success') {
        message.success('Conversation Title Updated Successfully!');
        refreshConversations();
      } else {
        message.error('Failed To Update Conversation Title.');
      }
      hideModal();
    } catch (error) {
      // Handle error
      message.error('An error occurred while updating conversation title.');
      console.error('Error updating conversation title:', error);
    }
  };

  const handleTitleChange = (e: any) => {
    setconvTitle(e.target.value);
  };

  const handleModelChange = (value: string) => {
    setModelName(value);
    // localStorage.setItem('LLM', value);
  };

  const handleSchemaChange = (value: any) => {
    console.log('value', value);
    setagentid(value);
    // localStorage.setItem('Agent', value);
  };

  const savePrompts = async () => {
    if (promtIndices.length > 0) {
      const uniqueArray = [...new Set(promtIndices)];
      uniqueArray.sort((a, b) => a - b);

      const payload = {
        agent_id: agentid,
        conversation_id: params.new === 'new' ? convId : params.new,
        conversation_index: uniqueArray,
      };
      const resp = await saveFewShot(payload);
      if (resp?.status === 'success') {
        message.success('Conversations Saved Successfully');
      } else {
        message.error('Failed to Save Conversations');
      }
    }
    setPromptIndices([]);
  };

  console.log('conversation', conv);

  const handleSync = async () => {
    setSyncLoad(true);
    console.log('sync', true); // This reflects the updated value

    await fetchData(false);

    setSyncLoad(false);
    console.log('syncafter', false); // This reflects the updated value
  };

  const actionItemsExtra =
    convId !== ''
      ? [
          ...[
            initialState?.currentUser?.superAdmin && (
              <Tooltip key={'3'} title="Enable Teach Mode for this conversation">
                {selfLearnStatus ? (
                  <Button
                    type="primary"
                    icon={<SaveFilled />}
                    onClick={() => {
                      setSelfLearnStatus(!selfLearnStatus);
                      savePrompts();
                    }}
                  >
                    Complete Teach Mode
                  </Button>
                ) : (
                  <Button
                    icon={<RollbackOutlined />}
                    onClick={() => {
                      setSelfLearnStatus(!selfLearnStatus);
                    }}
                  >
                    Start Teach Mode
                  </Button>
                )}
              </Tooltip>
            ),
          ],
          <Button key={'1'} icon={<EditFilled />} onClick={showModal} />,
          <Popconfirm
            key={'2'}
            placement="bottomRight"
            title="Delete Conversation"
            description="Are you sure you want to delete this conversation?"
            onConfirm={onDeleteConfirm}
            // onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <Button key={'4'} danger icon={<DeleteFilled />} />
          </Popconfirm>,
          <Tooltip key={'5'} title="Sync All Conversations">
            <Button
              loading={syncLoad}
              icon={<SyncOutlined />}
              disabled={params.new === 'new'}
              onClick={handleSync}
            />
          </Tooltip>,
        ]
      : [];

  return (
    <PageContainer
      style={{ background: 'white' }}
      extra={[
        <Select
          key="1"
          defaultValue="gemini-1.5-flash"
          value={modelName}
          style={{ width: 120 }}
          onChange={handleModelChange}
          options={[
            {
              label: <span>Select LLM</span>,
              title: 'Select LLM',
              options: [
                // {
                //   value: 'gpt-35-turbo-16k',
                //   label: (
                //     <>
                //       <OpenAIOutlined /> GPT 3.5
                //     </>
                //   ),
                // },
                // {
                //   value: 'gpt-4',
                //   label: (
                //     <>
                //       <OpenAIOutlined /> GPT 4
                //     </>
                //   ),
                // },
                // {
                //   value: 'mistral',
                //   label: (
                //     <>
                //       <WechatWorkOutlined /> Mixtral
                //     </>
                //   ),
                // },
                // {
                //   value: 'phi_3',
                //   label: (
                //     <>
                //       <WechatWorkOutlined /> Phi 3
                //     </>
                //   ),
                // },
                {
                  value: 'gemini-1.5-flash',
                  label: (
                    <>
                      <WechatWorkOutlined /> Gemini
                    </>
                  ),
                },
              ],
            },
          ]}
        />,
        <Select
          key="2"
          placeholder="Select Agent"
          value={agentid}
          style={{ width: 205 }}
          onChange={handleSchemaChange}
          disabled={params?.new !== 'new' || disableAgentCount > 0}
          options={[
            {
              label: <span>Select Agent</span>,
              title: 'Select Agent',
              options: allAgents.map((item: any) => ({ label: item?.name, value: item?._id })),
            },
          ]}
        />,
        ...actionItemsExtra,
      ]}
    >
      {/* {contextHolder} */}
      <Modal
        title="Title"
        open={open}
        onOk={handleSubmit}
        onCancel={hideModal}
        okText="Submit"
        cancelText="Cancel"
      >
        <Input value={convTitle} onChange={handleTitleChange} placeholder="Enter text here" />
      </Modal>
      <Row gutter={16}>
        <Col span={16} offset={sideBarConfig ? 0 : 4}>
          <div className={styles.scrollContainer} style={{ height: 'calc(100vh - 220px)' }}>
            {loading ? (
              <Skeleton active />
            ) : (
              <ChatMessageItem
                data={conv}
                columnsData={columnsData}
                setSideBarConfig={setSideBarConfig}
                schemaName={agentid}
                selfLearnStatus={selfLearnStatus}
                setPromptIndices={setPromptIndices}
                promtIndices={promtIndices}
                convId={convId}
                onMessageSend={onMessageSend}
              />
            )}
          </div>
          <SearchBar onMessageSend={onMessageSend} disableSearch={disabledSearch} />
        </Col>
        {sideBarConfig && (
          <Col span={8}>
            <ChatConfigCard sideBarConfig={sideBarConfig} setSideBarConfig={setSideBarConfig} />
          </Col>
        )}
      </Row>
    </PageContainer>
  );
};

export default ChatUI;
