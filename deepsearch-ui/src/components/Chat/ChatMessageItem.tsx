import { likeDisLike } from '@/services/ant-design-pro/api';
import {
  CopyOutlined,
  DislikeOutlined,
  DownloadOutlined,
  LikeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useModel, useParams } from '@umijs/max';
import {
  Avatar,
  Button,
  Checkbox,
  Input,
  List,
  Modal,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import logo from '../../images/assistant_logo.svg';
import ChatVisualizationCard from './ChatVisualizationCard';
import NewChartCards from './NewChartCards';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

interface ChatMessageItemProps {
  data: { role: string; content: string; table_data?: any[] }[];
  columnsData: object;
  setSideBarConfig: any;
  schemaName: any;
  selfLearnStatus: boolean;
  setPromptIndices: any;
  promtIndices: any;
  convId: any;
  onMessageSend: any;
  // initialChartConfig: {
  //   chart_type: string;
  //   xField: string;
  //   yField: string;
  //   category: string;
  // }
}

// const chart_config: chart_configProp = {
//   chart_type: 'Line',
//   xField: 'UserName',
//   yField: 'Logged Hours in Hours',
//   category: 'UserName',
// };

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  data,
  columnsData,
  setSideBarConfig,
  schemaName,
  selfLearnStatus,
  setPromptIndices,
  promtIndices,
  convId,
  onMessageSend,
}) => {
  const bottomRef = useRef<HTMLSpanElement | null>(null);
  const [selectedLikes, setSelectedLikes] = useState<number[]>([]);
  const [selectedDisLikes, setSelectedDisLikes] = useState<number[]>([]);
  const [disLikeOpen, setDisLikeOpen] = useState<boolean>(false);
  const [feedBack, setFeedBack] = useState<string>('');
  const { initialState } = useModel('@@initialState');
  const params = useParams();

  console.log('params', params);
  console.log('initialState', initialState);
  console.log('conv_data:', data);

  const scrollToBottom = () => {
    bottomRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if ((data && data.length > 0) || data?.role === 'loading') {
      scrollToBottom();
    }
  }, [data]);

  const onChange = (index: any) => (e: any) => {
    if (e.target.checked) {
      setPromptIndices([...promtIndices, index]);
    } else {
      setPromptIndices(promtIndices.filter((item) => item !== index));
    }
  };

  const handleLike = async (index: number) => {
    // console.log(index);
    if (selectedLikes.includes(index)) {
      setSelectedLikes(selectedLikes.filter((i) => i !== index));
    } else {
      setSelectedLikes([...selectedLikes, index]);
      setSelectedDisLikes(selectedDisLikes.filter((i) => i !== index));
      const payload = {
        email: initialState?.currentUser?.email,
        chatId: params.new === 'new' ? convId : params.new,
        msgId: index.toString(),
        liked: 1,
        feedback: '',
      };
      const response = await likeDisLike(payload);
      if (response?.status === 'success') {
        message.success('Thanks For Your Feedback');
      } else {
        message.error('Failed To Update Feedback.');
      }
      // console.log('like', response);
    }
  };

  const handleDisLike = async (index: number) => {
    if (selectedDisLikes.includes(index)) {
      setSelectedDisLikes(selectedDisLikes.filter((i) => i !== index));
    } else {
      setSelectedDisLikes([...selectedDisLikes, index]);
      setSelectedLikes(selectedLikes.filter((i) => i !== index));
      setDisLikeOpen(true);
    }
  };

  const handleDisLikeok = async () => {
    const index = selectedDisLikes[selectedDisLikes.length - 1]?.toString();
    const payload = {
      email: initialState?.currentUser?.email,
      chatId: params.new === 'new' ? convId : params.new,
      msgId: index,
      liked: -1,
      feedback: feedBack,
    };
    if (feedBack.trim().length > 0) {
      setDisLikeOpen(false);
      setFeedBack('');
      try {
        const response = await likeDisLike(payload);
        if (response?.status === 'success') {
          message.success('Thanks for Your Feedback');
        }
      } catch (error) {
        message.error('Failed To Update Feedback.');
      }
    }
  };

  const hideDisLikeModal = () => {
    setSelectedDisLikes([]);
    setDisLikeOpen(false);
  };

  const handleCopy = async (content: string, tableData: string) => {
    let copyContent = content;
    if (tableData && tableData.length > 0) {
      const headers = Object.keys(tableData[0]);
      const tableText = [
        headers.join('\t'), // Header row
        ...tableData.map((row) => headers.map((fieldName) => row[fieldName]).join('\t')),
      ].join('\r\n');
      copyContent += `\r\n\r\n${tableText}`;
    }
    try {
      await navigator.clipboard.writeText(copyContent);
      message.success('Content Copied To Clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
      message.error('Failed Copy Content');
    }
  };

  function handleDownload(column_data: any, tableData: any, containerId: any) {
    // Find the container element
    const container = document.getElementById(containerId);
    if (container) {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        console.error(`Canvas element not found in container "${containerId}"`);
        return;
      }

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.download = 'chart.png';

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          console.error('Failed to create blob from canvas');
        }
      }, 'image/png');
    } else {
      // message.info(`Switch To Graph View To Download Graph`);
      if (!tableData || tableData.length === 0) {
        message.error('No Data Available To Download');
      } else {
        const tableKeys = Object.keys(tableData[0]);
        const headers = tableKeys.map((key) => {
          const displayName = column_data[key]?.display_name;
          return displayName !== '' ? displayName : key;
        });
        const tableHeaders = Object.keys(tableData[0]);
        const csvData = [
          // content,
          // '',
          headers.join(','), // Header row
          ...tableData.map((row) =>
            tableHeaders.map((fieldName) => JSON.stringify(row[fieldName])).join(','),
          ),
        ].join('\r\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  return (
    <>
      {data?.length > 0 ? (
        <>
          <List
            style={{ marginBottom: '20px' }}
            itemLayout="vertical"
            size="large"
            dataSource={data}
            renderItem={(item: any, index) => (
              <List.Item
                style={{ borderBottom: 'none', padding: '20px 0px' }}
                key={index}
                actions={
                  item?.role === 'assistant'
                    ? [
                        <Space.Compact
                          key="Action"
                          block
                          style={{ marginLeft: '48px', marginBottom: '5px' }}
                        >
                          <Tooltip title="Like">
                            <Button
                              style={{
                                backgroundColor: selectedLikes.includes(index)
                                  ? 'rgba(0, 0, 0, 0.25)'
                                  : '',
                              }}
                              onClick={() => handleLike(index)}
                              icon={<LikeOutlined />}
                            />
                          </Tooltip>

                          <Tooltip title="Dislike">
                            <Button
                              style={{
                                backgroundColor: selectedDisLikes.includes(index)
                                  ? 'rgba(0, 0, 0, 0.25)'
                                  : '',
                              }}
                              onClick={() => handleDisLike(index)}
                              icon={<DislikeOutlined />}
                            />
                          </Tooltip>

                          <Tooltip title="Copy">
                            <Button
                              onClick={() => handleCopy(item?.content, item?.table_data)}
                              icon={<CopyOutlined />}
                            />
                          </Tooltip>

                          <Tooltip title="Download">
                            <Button
                              // onClick={() => handleDownload(item?.content, item?.table_data)}
                              onClick={() =>
                                handleDownload(
                                  columnsData,
                                  item?.table_data,
                                  `chart-container-${index}`,
                                )
                              }
                              icon={<DownloadOutlined />}
                            />
                          </Tooltip>
                        </Space.Compact>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={
                    item?.role === 'user' ? (
                      <>
                        {selfLearnStatus && (
                          <Checkbox
                            onChange={onChange(index)}
                            style={{ marginRight: '10px' }}
                          ></Checkbox>
                        )}
                        <Avatar shape="square" icon={<UserOutlined />} />
                      </>
                    ) : (
                      <>
                        {selfLearnStatus && (
                          <Checkbox
                            onChange={onChange(index)}
                            style={{ marginRight: '10px' }}
                          ></Checkbox>
                        )}
                        <Avatar shape="square" src={logo} />
                      </>
                    )
                  }
                  title={
                    <Text style={{ color: item?.role !== 'user' ? '#0093E9' : '' }}>
                      {item?.role === 'user' ? 'User' : ' '}
                    </Text>
                  }
                  description={
                    <>
                      {/* <Paragraph style={{ fontSize: '1em' }}>{item.content}</Paragraph> */}
                      {/* {item.table_data && item.table_data.length === 0 && item?.query_status && item?.query_status !== null ? (
                      <Alert
                        message="Data not found"
                        description="Could not find data for your query."
                        type="warning"
                        showIcon
                      />
                    ) : (
                      
                    )} */}
                      <Paragraph style={{ fontSize: '1em' }}>{item?.content}</Paragraph>
                      {item?.role === 'loading' && <Skeleton active paragraph={{ rows: 4 }} />}
                      <span ref={bottomRef} />
                      {item?.table_data && item['type'] === 'query' && (
                        <ChatVisualizationCard
                          // data={item.table_data}
                          // chart_config_data={item?.chart_rec}
                          item_data={item}
                          columnsData={columnsData}
                          setSideBarConfig={setSideBarConfig}
                          index={index}
                          content={item?.content}
                          schemaName={schemaName}
                          convId={convId}
                        />
                      )}
                    </>
                  }
                  // style={{ marginBlockEnd: 0 }}
                />
              </List.Item>
            )}
          />
          <Modal
            title="Give FeedBack"
            open={disLikeOpen}
            onOk={handleDisLikeok}
            onCancel={hideDisLikeModal}
            okText="Save"
            cancelText="Cancel"
          >
            <TextArea
              rows={4}
              value={feedBack}
              placeholder="Enter Message Here"
              onChange={(e) => setFeedBack(e.target.value)}
            />
          </Modal>
        </>
      ) : (
        <NewChartCards onMessageSend={onMessageSend} />
      )}
    </>
  );
};

export default ChatMessageItem;
