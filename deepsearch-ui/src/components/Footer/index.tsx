import { CopyrightCircleOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      copyright={false}
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'Digital Blanket',
          title: 'Digital Blanket',
          href: '#',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <CopyrightCircleOutlined />,
          href: '#',
          blankTarget: true,
        },
        {
          key: '2024',
          title: '2024',
          href: '#',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
