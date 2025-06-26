import { Button, Card, Space } from 'antd';
import React from 'react';

const SourcesComponent: React.FC = () => {
  return (
    <Space direction="vertical" size={16}>
      <Card size="small" title="Card 1" extra={<Button type="text">View</Button>}>
        <p>Card Content</p>
      </Card>
      <Card size="small" title="Card 2" extra={<Button type="text">View</Button>}>
        <p>Card Content</p>
      </Card>
      <Card size="small" title="Card 3" extra={<Button type="text">View</Button>}>
        <p>Card Content</p>
      </Card>
    </Space>
  );
};

export default SourcesComponent;
