import { Button, Card, Segmented, Space } from 'antd';
import React, { useState } from 'react';
// import DesignComponent from './ChatConfig/DesignComponent';
import { CloseOutlined } from '@ant-design/icons';
import SQLComponent from './ChatConfig/SQLComponent';
import SourcesComponent from './ChatConfig/SourcesComponent';

interface ChatConfigCardProps {
  sideBarConfig: any;
  setSideBarConfig: any;
}

const ChatConfiCard: React.FC<ChatConfigCardProps> = ({ sideBarConfig, setSideBarConfig }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleButtonClick = (option: string) => {
    setSelectedOption(option);
  };

  const renderContent = () => {
    switch (selectedOption) {
      // case 'Chat':
      //   return <Text strong>Chat content goes here...</Text>;
      // case 'Design':
      //   return <DesignComponent initialChartConfig={initialChartConfig} />;
      case 'Explanation':
        return <SQLComponent sideBarConfig={sideBarConfig} />;
      case 'Feedback':
        return <SourcesComponent />;
      default:
        return <SQLComponent sideBarConfig={sideBarConfig} />;
    }
  };

  return (
    <Card
      extra={[
        <Space key={'1'}>
          <Segmented
            options={['Explanation', 'Feedback']}
            defaultValue="Explanation"
            onChange={handleButtonClick}
          />
          <Button
            icon={<CloseOutlined />}
            onClick={() => {
              setSideBarConfig(null);
            }}
          />
        </Space>,
      ]}
      style={{
        marginLeft: '10px',
        height: '75vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {renderContent()}
    </Card>
  );
};

export default ChatConfiCard;
