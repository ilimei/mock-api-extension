import React, { useEffect, useRef, useState } from 'react';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers, keymap, placeholder } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { linter, lintGutter } from '@codemirror/lint';
import { Button, Space, Tooltip } from 'antd';
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

const jsonHighlighting = HighlightStyle.define([
  { tag: tags.string, color: '#a31515' },
  { tag: tags.number, color: '#098658' },
  { tag: tags.bool, color: '#0000ff' },
  { tag: tags.null, color: '#0000ff' },
  { tag: tags.propertyName, color: '#2a2aa5' },
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
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [isValidJson, setIsValidJson] = useState(true);

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    setIsValidJson(validateJson(value));

    const extensions: Extension[] = [
      lineNumbers(),
      json(),
      syntaxHighlighting(jsonHighlighting),
      lintGutter(),
      jsonLinter,
      keymap.of([...defaultKeymap, indentWithTab]),
      // Add placeholder extension if specified
      placeholderText ? placeholder(placeholderText) : [],
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          setIsValidJson(validateJson(newValue));
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
  }, [readOnly, height]);

  useEffect(() => {
    if (viewRef.current && value !== currentValue) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) {
        setIsValidJson(validateJson(value));
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

  const formatJson = () => {
    if (!viewRef.current) return;
    
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
  };

  const handleAction = (action: JsonEditorAction) => {
    if (viewRef.current) {
      action.onClick(viewRef.current, currentValue);
    }
  };

  return (
    <div className={`json-editor ${className}`}>
      {!hideDefaultToolbar && autoFormat && (
        <div className="json-editor-toolbar" style={{ 
          marginBottom: '8px', 
          padding: '8px', 
          background: '#f5f5f5', 
          borderRadius: '4px',
          display: 'flex',
          gap: '8px'
        }}>
          <Space align="center">
            <Tooltip title="Format JSON">
              <Button 
                onClick={formatJson}
                disabled={readOnly || !isValidJson}
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
                  disabled={action.disabled || readOnly || !isValidJson}
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
