import ContentWithTooltips from '@/components/Content';
import { generatePrompt } from '@/services/ant-design-pro/api';
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useLocation, useNavigate, useParams } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  Modal,
  Popconfirm,
  Select,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import PrompthForm from '../../components/PrompthForm';
import logo from '../../images/assistant_logo.svg';

const { Text } = Typography;
const { TextArea } = Input;

function AgentsEditPrompt() {
  const params = useParams();
  const [data, setData] = useState([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedRole, setEditedRole] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState('user');
  const [newContent, setNewContent] = useState('');
  const [hideSave, setHideSave] = useState(true);
  const [addInputError, setAddInputError] = useState(false);
  const [saveLoading, SetSaveLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const datasource_id = location?.state?.data;

  useEffect(() => {
    // Fetch data from the API
    async function fetchData() {
      const payload = {
        // id: ds_name.key,
        // ds_name: ds_name.environment,
        agent_id: params.agent_id,
        action: 'fetch',
        prompt: null,
      };
      console.log('agent id',params.agent_id)
      try {
        const resp = await generatePrompt(payload);
        if (resp?.status === 'success') {
          setData(resp?.resp_obj?.prompt);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleEditIconButton = (index: number) => {
    setEditingIndex(index);
    setEditedRole(data[index].role);
    setEditedContent(data[index].content);
  };

  const handleSave = (index: number, updatedData: any) => {
    // const updatedData = [...data];
    // updatedData[index] = {
    //   ...updatedData[index],
    //   role: editedRole,
    //   content: editedContent,
    // };
    // setData(updatedData);
    // setEditingIndex(null);
    // setHideSave(false);
    console.log('Updated Data:', updatedData);

    const updatedDataList = [...data];
    updatedDataList[index] = {
      ...updatedDataList[index],
      role: editedRole,
      content: editedRole !== 'assistant' ? updatedData : JSON.stringify(updatedData),
    };
    console.log('Updated Data List:', updatedDataList);
    setData(updatedDataList);
    setEditingIndex(null);
    setHideSave(false);
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRoleChange = (value: string) => {
    setEditedRole(value);
    // setHideSave(false);
  };

  // const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setEditedContent(e.target.value);
  //   // setHideSave(false);
  // };

  const handleDeleteButton = (index: number) => {
    const updatedData = data.filter((_, itemIndex) => itemIndex !== index); // Use filter to exclude the item to be deleted
    console.log(updatedData);
    setData(updatedData);
    setHideSave(false);
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancelModal = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  // const handleOk = () => {
  //   if (newContent.trim().length > 0) {
  //     const newData = {
  //       role: newRole,
  //       content: newContent,
  //     };
  //     setData([...data, newData]);
  //     setNewRole('');
  //     setNewContent('');
  //     setHideSave(false);
  //     setOpen(false);
  //   } else {
  //     setAddInputError(true);
  //   }
  // };

  const resetModalState = () => {
    setNewRole('user'); // Reset role to default
    setNewContent(''); // Reset content input
    setAddInputError(false); // Clear any previous error states
    setOpen(false); // Close the modal
    setHideSave(false);
  };

  const handleOk = (newdata) => {
    if (newRole === 'user' || newRole === 'system') {
      if (newContent.trim().length > 0) {
        const newData = {
          role: newRole,
          content: newdata,
        };
        setData([...data, newData]); // Add new data to the existing state
        resetModalState(); // Reset modal-related states
      } else {
        setAddInputError(true); // Show error if content is empty
      }
    } else if (newRole === 'assistant') {
      console.log('newdata---', JSON.stringify(newdata));
      const newData = {
        role: newRole,
        content: JSON.stringify(newdata),
      };
      setData([...data, newData]); // Add new data to the existing state
      resetModalState(); // Reset modal-related states
    } else {
      message.error('Invalid role selected.'); // Fallback error handling
    }
  };

  const handleNewRoleChange = (value: string) => {
    setNewRole(value);
  };

  const handleNewContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(e.target.value);
    if (e.target.value.length > 0) {
      setAddInputError(false);
    }
  };

  const handlePublishButton = async () => {
    console.log('prompt data', data);
    SetSaveLoading(true);
    try {
      const resp = await generatePrompt({
        // ds_name: params.db_name,
        agent_id: params.agent_id,
        action: 'update',
        prompt: data,
      });
      if (resp?.status === 'success') {
        message.success('Data  Updated Successfully');
        SetSaveLoading(false);
        setHideSave(true);
      } else {
        message.error('Failed To Update The Data');
        SetSaveLoading(false);
      }
    } catch (error) {
      message.error('An error occurred while updating the data');
    }
  };

  const parseContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Invalid JSON:', e);
      return {};
    }
  };

  const handleEncodedTextClick = () => {
    const Agenytype = 'mysql';
    navigate(`/datasources/${datasource_id?.datasource_id}`, { state: { Agenytype } });
  };

  return (
    <PageContainer
      extra={[
        !hideSave && (
          <Button type="primary" key={'1'} loading={saveLoading} onClick={handlePublishButton}>
            Save
          </Button>
        ),
        <Button key={'2'} icon={<PlusOutlined />} onClick={showModal}>
          Add
        </Button>,
      ]}
    >
      <List
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item
            extra={[
              editingIndex !== index && (
                // <></>
                // <span key={'1'}>
                //   <Button
                //     type="text"
                //     icon={<CheckOutlined />}
                //     style={{ margin: '5px' }}
                //     onClick={() => handleSave(index, parseContent(data[index].content))}
                //   />
                //   <Button
                //     type="text"
                //     icon={<CloseOutlined />}
                //     style={{ margin: '5px' }}
                //     onClick={handleCancel}
                //   />
                // </span>
                // ) : (
                <Button
                  key={'2'}
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditIconButton(index)}
                />
              ),
              <Popconfirm
                key={'3'}
                placement="bottomRight"
                title="Delete Query"
                description="Are you sure you want to delete this ?"
                onConfirm={() => handleDeleteButton(index)}
                // onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                item?.role === 'user' ? (
                  <Avatar shape="square" icon={<UserOutlined />} />
                ) : (
                  <Avatar shape="square" src={logo} />
                )
              }
              title={
                editingIndex === index ? (
                  <Select
                    defaultValue={item?.role}
                    style={{ width: 100, marginBottom: '10px' }}
                    onChange={handleRoleChange}
                    options={[
                      { value: 'system', label: 'System' },
                      { value: 'user', label: 'User' },
                      { value: 'assistant', label: 'Assistant' },
                    ]}
                  />
                ) : (
                  <Text style={{ color: item?.role !== 'user' ? '#0093E9' : null }}>
                    {item?.role.charAt(0).toUpperCase() + item?.role.slice(1)}
                  </Text>
                )
              }
              description={
                editingIndex === index ? (
                  <Card
                    style={{
                      width: '100%',
                      padding: '0px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff',
                    }}
                  >
                    {editedRole === 'user' ||
                    editedRole === 'system' ||
                    item.role === 'user' ||
                    item.role === 'system' ? (
                      <>
                        <TextArea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          autoSize={{ minRows: 4, maxRows: 10 }}
                          status={addInputError ? 'error' : ''}
                          placeholder={addInputError ? 'Please Enter something' : ''}
                        />
                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                          <Button
                            onClick={() => handleSave(index, editedContent)}
                            type="primary"
                            style={{ marginRight: '15px' }}
                          >
                            Done
                          </Button>
                          <Button onClick={handleCancel}>Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <PrompthForm
                        formData={parseContent(data[index]?.content)}
                        disable={false}
                        show={false}
                        onChange={(updatedData) => handleSave(index, updatedData)}
                        onCancel={() => handleCancel()}
                        id={params.agent_id}
                      />
                    )}
                  </Card>
                ) : item?.role === 'assistant' ? (
                  <PrompthForm formData={parseContent(item.content)} disable={true} show={true}  id={params.agent_id}/>
                ) : (
                  // <Paragraph>
                  //   {item?.content.trim().length > 1000
                  //     ? `${item?.content.substring(0, 1000)}...`
                  //     : item?.content}
                  // </Paragraph>
                  <ContentWithTooltips
                    content={item?.content}
                    onEncodedTextClick={handleEncodedTextClick}
                  />
                )
              }
            />
          </List.Item>
        )}
      />
      <Modal
        title="Title"
        open={open}
        footer={
          newRole === 'assistant'
            ? null
            : [
                <Button key="submit" type="primary" onClick={() => handleOk(newContent)}>
                  Done
                </Button>,
                <Button key="back" onClick={handleCancelModal}>
                  Cancel
                </Button>,
              ]
        }
        // onOk={handleOk}
        // onCancel={handleCancelModal}
      >
        <Select
          defaultValue="user"
          style={{ width: 100, marginBottom: '15px' }}
          onChange={handleNewRoleChange}
          value={newRole}
          options={[
            { value: 'system', label: 'System' },
            { value: 'user', label: 'User' },
            { value: 'assistant', label: 'Assistant' },
          ]}
        />
        {newRole === 'user' || newRole === 'system' ? (
          <>
            <TextArea
              placeholder="Description"
              value={newContent}
              onChange={handleNewContentChange}
              rows={4}
              status={addInputError ? 'error' : ''}
            />
            {addInputError && <Text type="danger">Please Enter Something</Text>}
          </>
        ) : (
          <PrompthForm
            disable={false}
            show={false}
            onChange={(values) => {
              setNewContent(values);
              handleOk(values);
            }}
            id={params.agent_id}
            onCancel={() => handleCancelModal()}
          />
        )}
      </Modal>
    </PageContainer>
  );
}

export default AgentsEditPrompt;
