import React, { useEffect, useRef, useState } from 'react';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers, keymap, placeholder } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { linter, lintGutter } from '@codemirror/lint';
import { Button, Space, Tooltip, Radio } from 'antd';
import { FormatPainterOutlined } from '@ant-design/icons';

// Define interface for custom actions
interface JsonEditorAction {
  key: string;
  label: string;
  onClick: (editor: EditorView, value: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface JsonEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  autoFormat?: boolean;
  className?: string;
  actions?: JsonEditorAction[];
  hideDefaultToolbar?: boolean;
  placeholder?: string;
  language?: 'json' | 'javascript';
}

// @ts-expect-error not error
const jsonLinter = linter(view => {
  const doc = view.state.doc.toString();
  const diagnostics = [];
  
  try {
    JSON.parse(doc);
  } catch (e) {
    if (e instanceof Error) {
      const match = /at position (\d+)/.exec(e.message);
      if (match) {
        const pos = parseInt(match[1], 10);
        const line = view.state.doc.lineAt(pos);
        diagnostics.push({
          from: Math.max(0, line.from),
          to: line.to,
          severity: 'error',
          message: e.message
        });
      }
    }
  }
  
  return diagnostics;
});

const codeHighlighting = HighlightStyle.define([
  { tag: tags.string, color: '#a31515' },
  { tag: tags.number, color: '#098658' },
  { tag: tags.bool, color: '#0000ff' },
  { tag: tags.null, color: '#0000ff' },
  { tag: tags.propertyName, color: '#2a2aa5' },
  { tag: tags.comment, color: '#008000' },
  { tag: tags.keyword, color: '#0000ff' },
  { tag: tags.function(tags.variableName), color: '#795e26' },
]);

const JsonEditor: React.FC<JsonEditorProps> = ({
  value = '',
  onChange,
  height = '300px',
  readOnly = false,
  autoFormat = true,
  className = '',
  actions = [],
  hideDefaultToolbar = false,
  placeholder: placeholderText,
  language = 'json',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [isValidContent, setIsValidContent] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'json' | 'javascript'>(language);

  const validateContent = (content: string): boolean => {
    if (currentLanguage === 'json') {
      try {
        JSON.parse(content);
        return true;
      } catch (e) {
        return false;
      }
    }
    // For JavaScript, we don't validate syntax here
    return true;
  };

  useEffect(() => {
    if (!editorRef.current) return;

    setIsValidContent(validateContent(value));

    const extensions: Extension[] = [
      lineNumbers(),
      currentLanguage === 'json' 
        ? json() 
        : javascript({ jsx: false, typescript: false }),
      syntaxHighlighting(codeHighlighting),
      keymap.of([...defaultKeymap, indentWithTab]),
      // Add placeholder extension if specified
      placeholderText ? placeholder(placeholderText) : [],
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          setIsValidContent(validateContent(newValue));
          setCurrentValue(newValue);
          onChange?.(newValue);
        }
      }),
      EditorView.theme({
        "&": {
          height: height,
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontFamily: '"Menlo", "Monaco", monospace',
          fontSize: "14px",
        },
        ".cm-scroller": { overflow: "auto" },
        ".cm-content": { whiteSpace: "pre-wrap" },
      })
    ];

    // Only apply linter for JSON
    if (currentLanguage === 'json') {
      extensions.push(lintGutter(), jsonLinter);
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    const startState = EditorState.create({
      doc: currentValue,
      extensions
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [readOnly, height, currentLanguage]);

  useEffect(() => {
    if (viewRef.current && value !== currentValue) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) {
        setIsValidContent(validateContent(value));
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: value
          }
        });
        setCurrentValue(value);
      }
    }
  }, [value]);

  useEffect(() => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language);
    }
  }, [language]);

  const formatCode = () => {
    if (!viewRef.current) return;
    
    if (currentLanguage === 'json') {
      try {
        const doc = viewRef.current.state.doc.toString();
        const parsed = JSON.parse(doc);
        const formatted = JSON.stringify(parsed, null, 2);
        
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: doc.length,
            insert: formatted
          }
        });
        
        onChange?.(formatted);
      } catch (e) {
        // Invalid JSON, don't format
      }
    } else {
      // For JavaScript, we would need a JS formatter
      // This would typically use a library like prettier
      // But for simplicity, we're not implementing it here
    }
  };

  const handleAction = (action: JsonEditorAction) => {
    if (viewRef.current) {
      action.onClick(viewRef.current, currentValue);
    }
  };

  return (
    <div className={`json-editor ${className}`}>
      {!hideDefaultToolbar && (
        <div className="json-editor-toolbar" style={{ 
          marginBottom: '8px', 
          padding: '8px', 
          background: '#f5f5f5', 
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <Space align="center">
            <Tooltip title="Format Code">
              <Button 
                onClick={formatCode}
                disabled={readOnly || (currentLanguage === 'json' && !isValidContent)}
                size="small"
                type="primary"
                icon={<FormatPainterOutlined />}
                style={{ height: '28px' }}
              >
                Format
              </Button>
            </Tooltip>
            {actions.map((action) => (
              <Tooltip key={action.key} title={action.label}>
                <Button
                  onClick={() => handleAction(action)}
                  disabled={action.disabled || readOnly || (currentLanguage === 'json' && !isValidContent)}
                  icon={action.icon}
                  size="small"
                  type="default"
                  style={{ marginLeft: '4px', height: '28px' }}
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}
          </Space>
        </div>
      )}
      <div ref={editorRef} className="editor-container" />
    </div>
  );
};

export default JsonEditor;
