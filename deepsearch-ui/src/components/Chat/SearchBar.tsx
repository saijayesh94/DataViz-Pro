import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { Button, Input } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useStyles = createStyles(() => {
  return {
    InputButton: {
      padding: '15px',
      borderRadius: '50px',
      '&:focus, &:focus-within,&:hover': {
        border: '5px solid  rgba(5,5,5,0.2)',
        outline: 'none',
      },
      border: '5px solid  rgba(5,5,5,0.15)',
      paddingLeft: '20px',
      // position: 'fixed',
      // bottom: '20px',
      // width: '50%',
      // zIndex: 99999,
    },
  };
});

interface ChatUIProps {
  onMessageSend: any;
  disableSearch: boolean;
}

const SearchBar: React.FC<ChatUIProps> = ({ onMessageSend, disableSearch }) => {
  const [searchMessage, setSearchMessage] = useState('');
  const { styles } = useStyles();
  const { transcript, listening, finalTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const params = useParams();

  useEffect(() => {
    if (listening && transcript) setSearchMessage(transcript);
  }, [transcript]);

  useEffect(() => {
    if (finalTranscript) {
      if (onMessageSend) {
        onMessageSend(searchMessage);
        setSearchMessage('');
      }
      SpeechRecognition.stopListening();
    }
  }, [finalTranscript]);

  useEffect(() => {
    setSearchMessage('');
  }, [params]);

  const onSend = () => {
    if (searchMessage.trim().length > 0) {
      setSearchMessage('');
      onMessageSend(searchMessage);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      console.log('KEYPESS');
      onSend();
    }
  };

  const handleAudioClick = () => {
    SpeechRecognition.startListening();
  };

  const suffix = (
    <>
      {browserSupportsSpeechRecognition && (
        <Button
          type="text"
          shape="circle"
          icon={<AudioOutlined />}
          style={{
            border: 'none',
            color: listening ? 'white' : 'inherit',
            backgroundColor: listening && 'red',
          }}
          onClick={handleAudioClick}
        />
      )}
      <Button
        type="text"
        shape="circle"
        disabled={disableSearch}
        onClick={onSend}
        icon={<SendOutlined />}
        style={{ border: 'none' }}
      />
    </>
  );
  return (
    <Input
      placeholder="Enter your message"
      value={searchMessage}
      disabled={disableSearch}
      size="large"
      suffix={suffix}
      className={styles.InputButton}
      onChange={(e) => {
        setSearchMessage(e.target.value);
      }}
      onKeyDown={handleKeyPress}
    />
  );
};

export default SearchBar;
