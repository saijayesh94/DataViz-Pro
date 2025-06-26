import { AutoFill, getAllAgents, getDataSourceDetails, modifyTextSource } from '@/services/ant-design-pro/api';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Button, Input, List, Modal, Popconfirm, Select, Space, Tooltip, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

function TextSourceEditor({ db_name, type }) {
  const params = useParams();

  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [inputError, setInputError] = useState<boolean>(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishIndexInput, setPublishIndexInput] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentSelectVisible, setAgentSelectVisible] = useState(true);
  const [isAgentSelectVisible, setIsAgentSelectVisible] = useState(false); // State to control visibility of the Select dropdown
  const [isLoading, setIsLoading] = useState(false); // State to manage the loading state of the "Auto Fill" button

  useEffect(() => {
    const fetchSourceDetails = async () => {
      const data = await getDataSourceDetails({
        datasource_id: params.db_name,
        ds_name: db_name,
        type: type,
        index_name: null,
        action: 'fetch',
        schema_description: null,
      });
      console.log('data api text_source', data);
      if (data?.resp_obj) {
        const apidata = data?.resp_obj?.all_documents;
        console.log('apidata fetch text_source', apidata);
        setData(apidata);
      }
    };
    fetchSourceDetails();
    
    const fetchAgents = async () => {
      const response = await getAllAgents();
      if (response?.status === 'success') {
        setAgents(response?.resp_obj?.agents);
      }
    };
    fetchAgents();

  }, [db_name, type]);
  const handleAutoFillButtonClick = () => {
    setIsAgentSelectVisible(true); // Show the Select dropdown
  };
  const handleAgentSelect = async (value) => {
    setSelectedAgent(value);
    setIsAgentSelectVisible(false);
    try {
      setIsLoading(true);
      const response = await AutoFill({ agent_id: value });
      if (response?.status === 'success') {
        setNewContent(response.resp_obj);
      }
    } catch (error) {
      message.error('Failed to fetch KPI details');
    }finally {
      setIsLoading(false); // Stop loading after response
    }
  };

  const handleAddButton = () => {
    setSelectedAgent(null);
    setAddModalOpen(true);
  };

  const handleEditIconButton = (id: string) => {
    const item = data.find((d) => d._id === id);
    if (item) {
      setEditingId(id);
      setEditedContent(item.content);
    }
  };

  const handleSave = async (id: string) => {
    if (editedContent.trim().length > 0) {
      const editpayload = {
        datasource_id: params.db_name,
        //ds_name: db_name,
        document_id: id,
        action: 'edit',
        content: editedContent,
      };
      const resp = await modifyTextSource(editpayload);
      if (resp?.status === 'success') {
        message.success('Successfully Edited Data');
        const updatedData = data.map((item) =>
          item._id === id ? { ...item, content: resp.resp_obj.content } : item,
        );
        setData(updatedData);
        setEditingId(null);
      } else {
        message.error('Failed Edit Data');
      }
    } else {
      setInputError(true);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDeleteButton = async (id: string) => {
    const deletePayload = {
      datasource_id: params.db_name,
      //ds_name: db_name,
      document_id: id,
      action: 'delete',
      content: null,
    };
    const resp = await modifyTextSource(deletePayload);
    if (resp?.status === 'success') {
      message.success('Successfully Deleted ');
      const updatedData = data.filter((item) => item._id !== id);
      setData(updatedData);
    } else {
      message.error('Failed Delete Data');
    }
  };

  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
    if (e.target.value.length > 0) {
      setInputError(false);
    }
  };

  const handleOk = async () => {
    if (newContent.trim().length > 0) {
      const payload = {
        datasource_id: params.db_name,
        //ds_name: db_name,
        document_id: null,
        action: 'insert',
        content: newContent,
      };
      const resp = await modifyTextSource(payload);
      console.log('resp data', resp);
      setAddModalOpen(false);
      if (resp?.status === 'success') {
        message.success('Text Added Successfully');
        const updatedData = resp?.resp_obj;
        setData([...data, updatedData]);
        setNewContent('');
        setInputError(false);
      } else {
        message.error('Failed Add Text');
        setNewContent('');
        setInputError(false);
      }
    } else {
      setInputError(true);
    }
  };

  const handleCancelModal = () => {
    setAddModalOpen(false);
    setInputError(false);
    setNewContent('');
  };

  const handleNewContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(e.target.value);
    if (e.target.value.length > 0) {
      setInputError(false);
    }
  };

  const handlePublishButton = () => {
    setPublishIndexInput(db_name);
    setPublishModalOpen(true);
  };

  const handlePublishOk = async () => {
    // if (publishIndexInput.trim().length > 0) {
    const payload = {
      datasource_id: params.db_name,
      ds_name: db_name,
      type: type,
      action: 'update',
      index_name: publishIndexInput,
      schema_description: null,
    };
    const resp = await getDataSourceDetails(payload);
    if (resp?.status === 'success') {
      message.success('Data Updated Successfully');
    } else {
      message.error('Failed Update Data');
    }
    setPublishModalOpen(false);
    // setPublishIndexInput('');
    // } else {
    //   message.error('Please enter  Index Name to Publish.');
    // }
  };

  const handlePublishCancel = () => {
    setPublishModalOpen(false);
    // setPublishIndexInput('');
  };

  return (
    <PageContainer
      extra={[
        <Button key={'1'} onClick={handlePublishButton}>
          Create Index
        </Button>,
        <Button key={'2'} icon={<PlusOutlined />} onClick={handleAddButton}>
          Add
        </Button>,
      ]}
    >
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              editingId === item._id ? (
                <span key={'1'}>
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    onClick={() => handleSave(item._id)}
                  />
                  <Button type="text" icon={<CloseOutlined />} onClick={handleCancel} />
                </span>
              ) : (
                <Button
                  key={'2'}
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditIconButton(item._id)}
                />
              ),
              <Popconfirm
                key={'3'}
                placement="bottomRight"
                title="Delete Text"
                description="Are you sure you want to delete this?"
                onConfirm={() => handleDeleteButton(item._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Popconfirm>,
            ]}
          >
            {editingId === item._id ? (
              <TextArea
                value={editedContent}
                onChange={handleContentChange}
                autoSize={{ minRows: 4, maxRows: 10 }}
                status={inputError ? 'error' : ''}
                placeholder={inputError ? 'Please Enter Something' : ''}
              />
            ) : (
              <Paragraph>{item.content}</Paragraph>
            )}
          </List.Item>
        )}
      />
      <Modal
        title="Add Text"
        open={addModalOpen}
        onOk={handleOk}
        okText="Add"
        onCancel={handleCancelModal}
        footer={[
          <Button key="back" onClick={handleCancelModal}>
            Cancel
          </Button>,
          // agentSelectVisible && (
          //   <Select
          //     placeholder="Auto-fill System/KPI details"
          //     style={{ width: 'auto', margin:'0.2rem' }}
          //     value={selectedAgent}
          //     onChange={handleAgentSelect}
          //     loading={isLoading}
          //     disabled={isLoading}
          //   >
          //     {agents.map((agent: any) => (
          //       <Select.Option key={agent?._id} value={agent?._id}>
          //         {agent?.name}
          //       </Select.Option>
          //     ))}
          //   </Select>
          // ),
          <Button key="submit" type="primary" onClick={handleOk} disabled={isLoading}>
            Add
          </Button>,
        ]}
      >
        <TextArea
          placeholder="Description"
          value={newContent}
          onChange={handleNewContentChange}
          rows={4}
          status={inputError ? 'error' : ''}
        />
        {inputError && <Text type="danger">Please Enter Something</Text>}
      </Modal>
      
      <Modal
        title="Publish"
        open={publishModalOpen}
        onOk={handlePublishOk}
        onCancel={handlePublishCancel}
        okText="Publish"
      >
        <Space align="center">
          <Tooltip title="Creates an index on the database to optimize and enhance the efficiency of text search queries">
            <InfoCircleOutlined />
          </Tooltip>
          <Paragraph style={{ marginBottom: '0px' }}>Index Name:</Paragraph>
          <Input
            value={publishIndexInput}
            disabled
            // onChange={(e) => setPublishIndexInput(e.target.value)}
            // defaultValue={db_name}
            style={{ border: '1px solid #d9d9d9' }}
          />
        </Space>
      </Modal>
    </PageContainer>
  );
}

export default TextSourceEditor;
