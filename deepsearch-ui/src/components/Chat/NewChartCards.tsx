import { useModel } from '@umijs/max';
import { Card, Col, Row, theme } from 'antd';
import React from 'react';
import {useState} from 'react';


/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href?: string;
  question: string;
  onMessageSend: (message: string) => void;
}> = ({ title, desc,question,onMessageSend }) => {
  const { useToken } = theme;

  const { token } = useToken();

  const handleInfoCardClick = () =>{
    console.log('info card clicked',question)
    onMessageSend(question);
  }

  return (
    <Col
      span={24}
      style={{
        marginBottom: '10px',
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        // width: '100%',
        // flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleInfoCardClick}
      >
        <div
          style={{
            fontSize: '16px',
            lineHeight: '22px',
            color: token.colorText,
            // paddingBottom: 8,
          }}
        >
         {title}
          <div
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              textAlign: 'justify',
              lineHeight: '32px',
              // marginBottom: 8,
            }}
          >
            {desc}
          </div>
        </div>
      </div>
    </Col>
  );
};

interface NewChartCardsProps{
  onMessageSend: (message: string) => void;
}

const NewChartCards: React.FC<NewChartCardsProps> = ({onMessageSend}) => {

  const messageData = [
    {
      title: "Explore the Digital Blanket data from your buildings",
      subtitle: "Ask 'Compare a specific AHU KPI against a different AHU from various buildings.'",
      question: "Compare a specific AHU KPI against a different AHU from various buildings."
    },
    {
      title: "Visualize Trends and Build Dashbaords",
      subtitle: "Ask 'Show me the trend of the AHU01 from FT Bangalore GF'",
      question: "Show me the trend of the AHU01 from FT Bangalore GF."
    },
  ]

  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [message, setMessage] = useState(messageData)
  return (
    <Card
      style={{
        borderRadius: 8,
        border: 'none',
      }}
      bodyStyle={{
        backgroundImage:
          initialState?.settings?.navTheme === 'realDark'
            ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
            : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
      }}
    >
      <div
        style={{
          backgroundPosition: '100% -30%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '274px auto',
          backgroundImage:
            "url('genai_ui/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ.png')",
        }}
      >
        <div
          style={{
            fontSize: '20px',
            // color: token.colorTextHeading,
          }}
        >
          {
            <img
              alt="logo"
              style={{ marginLeft: '-10px', width: '300px', marginBottom: '20px' }}
              src="/genai_ui/db_logo.svg"
            />
          }
        </div>
        <div
          style={{
            fontSize: '20px',
            color: token.colorTextHeading,
          }}
        >
          Generative AI Analytics and Dashboards
        </div>
        <p
          style={{
            fontSize: '14px',
            color: token.colorTextSecondary,
            lineHeight: '22px',
            marginTop: 16,
            marginBottom: 32,
            width: '65%',
          }}
        >
          Converse with your data using natural language, visualize and build your own dashboards.
        </p>
        {/* <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <InfoCard
            index={1}
            href="https://umijs.org/docs/introduce/introduce"
            title="了解 umi"
            desc="umi 是一个可扩展的企业级前端应用框架,umi 以路由为基础的，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。"
          />
          <InfoCard
            index={2}
            title="了解 ant design"
            href="https://ant.design"
            desc="antd 是基于 Ant Design 设计体系的 React UI 组件库，主要用于研发企业级中后台产品。"
          />
          <InfoCard
            index={3}
            title="了解 Pro Components"
            href="https://procomponents.ant.design"
            desc="ProComponents 是一个基于 Ant Design 做了更高抽象的模板组件，以 一个组件就是一个页面为开发理念，为中后台开发带来更好的体验。"
          />
        </div> */}
        <Row>
          {message.map((item,index) =>(
            <InfoCard
              key={index}
              index={index}
              title={item.title}
              desc={item.subtitle}
              question={item.question}
              onMessageSend={onMessageSend}
            />
          ))}
        </Row>
      </div>
    </Card>
  );
};

export default NewChartCards;
