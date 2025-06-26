import { Tooltip, Typography } from 'antd';

const { Paragraph } = Typography;

const ContentWithTooltips = ({ content, onEncodedTextClick }) => {
  // Regular expression to find encoded text within <>
  const encodedTextRegex = /<([^>]+)>/g;

  // Process content to replace encoded text with Tooltip components
  const renderContent = () => {
    const parts = content.split(encodedTextRegex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is the encoded text
        return (
          <Tooltip
            key={index}
            title="Click for more information"
            onClick={() => onEncodedTextClick(part)}
          >
            <span style={{ color: 'blue', cursor: 'pointer' }}>{part}</span>
          </Tooltip>
        );
      }
      return part; // Plain text
    });
  };

  return <Paragraph>{renderContent()}</Paragraph>;
};

export default ContentWithTooltips;

// export default function App() {
//   const content =
//     "Here is some text with an <encoded> part and another <example> encoded text.";

//   const handleEncodedTextClick = (text) => {
//     console.log("Clicked on encoded text:", text);
//     // Add your custom function logic here
//   };

//   return (
//     <ContentWithTooltips
//       content={content}
//       onEncodedTextClick={handleEncodedTextClick}
//     />
//   );
// }
