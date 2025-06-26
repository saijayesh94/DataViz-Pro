import { CopyOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, Timeline, Typography } from 'antd';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Text, Paragraph } = Typography;

interface SQLComponentProps {
  sideBarConfig: any;
}

const SQLComponent: React.FC<SQLComponentProps> = ({ sideBarConfig }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const sqlCode = `SELECT
  //   e.JOB_ID,
  //   AVG(e.SALARY) AS average_salary
  // FROM
  //   emp_db.employees e
  // GROUP BY
  //   e.JOB_ID
  // ORDER BY
  //   e.JOB_ID;`;

  const showModal = () => {
    setIsModalVisible(true);
  };

  // const handleOk = () => {
  //   setIsModalVisible(false);
  // };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const SQLData = () => (
    <>
      <Text strong style={{ marginBottom: '8px' }}>
        SQL Code:
      </Text>
      {sideBarConfig?.query_status === null || sideBarConfig?.query_status === true ? (
        <>
          <div style={{ position: 'relative', background: 'rgb(246,248,250)' }}>
            <div style={{ position: 'absolute', top: '0', right: '0', padding: '8px' }}>
              <CopyOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
            </div>
            <SyntaxHighlighter
              language="sql"
              style={a11yDark}
              wrapLines={true}
              lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
            >
              {sideBarConfig?.sql_query}
            </SyntaxHighlighter>
          </div>
          <Paragraph>{sideBarConfig?.explanation}</Paragraph>
        </>
      ) : (
        <>
          <Alert
            message="Error"
            type="error"
            description="SQL query Could not be Generated."
            showIcon
            style={{ marginTop: '15px' }}
          />
          <SyntaxHighlighter
            language="sql"
            style={a11yDark}
            wrapLines={true}
            lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
          >
            {sideBarConfig?.sql_query}
          </SyntaxHighlighter>
        </>
      )}
    </>
  );

  return (
    <>
      <Timeline
        items={[
          {
            children: 'Parsing and Analyzing the Query',
          },
          // {
          //   children: sideBarConfig?.rag_data,
          // },
          ...(sideBarConfig?.rag_data
            ? [
                {
                  children: (
                    <>
                      <Paragraph style={{ marginBottom: '3px' }}>Fetching relevant data</Paragraph>
                      <Button type="link" onClick={showModal} style={{ padding: '0px' }}>
                        View Data
                      </Button>
                    </>
                  ),
                },
              ]
            : []),
          {
            children: SQLData(),
          },
          {
            children: 'Data extracted by Dashbaord Agent',
          },
        ]}
      />
      <Modal
        title="RAG Data"
        open={isModalVisible}
        //  onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
      >
        {/* <div> */}
        {sideBarConfig?.rag_data?.map((element: string, index: string) => (
          <Paragraph key={index}>{element}</Paragraph>
        ))}
        {/* </div> */}
      </Modal>
    </>
  );
};

export default SQLComponent;
