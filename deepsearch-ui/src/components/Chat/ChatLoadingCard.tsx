import { FileTextOutlined, LoadingOutlined, ReadOutlined, StarOutlined } from '@ant-design/icons';
import { Card, Timeline } from 'antd';
import React, { useEffect, useState } from 'react';

const ChatLoadingCard: React.FC = () => {
  const [visibleItem, setVisibleItem] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleItem((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (visibleItem > -1) {
      setIsLoading(true);
      const spinTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(spinTimer);
    }
  }, [visibleItem]);

  const timelineItems = [
    {
      dot: isLoading && visibleItem === 0 ? <LoadingOutlined /> : <StarOutlined />,
      children: 'Copilot',
    },
    {
      dot: isLoading && visibleItem === 1 ? <LoadingOutlined /> : <ReadOutlined />,
      children: 'Understanding your question',
    },
    {
      dot: isLoading && visibleItem === 2 ? <LoadingOutlined /> : <FileTextOutlined />,
      children: 'Finding where this data is located',
    },
    { dot: <LoadingOutlined />, children: 'Gathering Context' }, // Always show loading for the last item
  ];

  return (
    <Card style={{ width: '100%', height: '200px' }}>
      <Timeline>
        {timelineItems.slice(0, visibleItem + 1).map((item, index) => (
          <Timeline.Item key={index} dot={item.dot}>
            {item.children}
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

export default ChatLoadingCard;
