import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
  Toolbar,
} from '@mui/material';
import { ContentCopy, Fullscreen, FullscreenExit } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import copy from 'copy-to-clipboard';

interface MarkdownViewerProps {
  content: string;
  title?: string;
  maxHeight?: number;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  title = "Analysis Results",
  maxHeight = 600,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    const success = copy(content);
    if (success) {
      setCopySuccess(true);
    }
  };

  const handleCloseCopyAlert = () => {
    setCopySuccess(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          mt: 2,
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 1300 : 'auto',
          maxHeight: isFullscreen ? '100vh' : maxHeight,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar */}
        <Toolbar 
          variant="dense" 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            minHeight: 48,
            backgroundColor: 'grey.50',
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          <Tooltip title="Copy markdown content">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopy />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Content */}
        <Box
          sx={{
            p: 2,
            overflow: 'auto',
            flexGrow: 1,
            '& .markdown-content': {
              fontFamily: 'inherit',
              lineHeight: 1.6,
            },
            '& .markdown-content h1': {
              fontSize: '1.5rem',
              fontWeight: 600,
              marginTop: '1.5rem',
              marginBottom: '1rem',
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              paddingBottom: '0.5rem',
            },
            '& .markdown-content h2': {
              fontSize: '1.25rem',
              fontWeight: 600,
              marginTop: '1.25rem',
              marginBottom: '0.75rem',
              color: 'primary.main',
            },
            '& .markdown-content h3': {
              fontSize: '1.1rem',
              fontWeight: 600,
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: 'text.primary',
            },
            '& .markdown-content p': {
              marginBottom: '1rem',
            },
            '& .markdown-content ul, & .markdown-content ol': {
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
            },
            '& .markdown-content li': {
              marginBottom: '0.25rem',
            },
            '& .markdown-content blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              paddingLeft: '1rem',
              margin: '1rem 0',
              fontStyle: 'italic',
              backgroundColor: 'grey.50',
              padding: '0.5rem 1rem',
            },
            '& .markdown-content table': {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1rem',
            },
            '& .markdown-content th, & .markdown-content td': {
              border: '1px solid',
              borderColor: 'divider',
              padding: '0.5rem',
              textAlign: 'left',
            },
            '& .markdown-content th': {
              backgroundColor: 'grey.100',
              fontWeight: 600,
            },
            '& .markdown-content code': {
              backgroundColor: 'grey.100',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
            '& .markdown-content pre': {
              backgroundColor: 'grey.900',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              marginBottom: '1rem',
            },
            '& .markdown-content pre code': {
              backgroundColor: 'transparent',
              padding: 0,
              color: 'inherit',
            },
          }}
        >
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;

                  return !isInline ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </Box>
      </Paper>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseCopyAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyAlert} severity="success" sx={{ width: '100%' }}>
          Markdown content copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default MarkdownViewer;
