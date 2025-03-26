import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Switch from 'antd/es/switch';
import Typography from 'antd/es/typography';
import Layout from 'antd/es/layout';
import Space from 'antd/es/space';
import Divider from 'antd/es/divider';
import Button from 'antd/es/button';
import {
  AppstoreOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import mockDataManaer, { IProject } from '../common/mockDataManagerClient';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const [enabled, setEnabled] = useState(true);
  const [currentDomain, setCurrentDomain] = useState('');
  const [projects, setProjects] = useState<IProject[]>([]);

  // Function to update badge text
  const updateBadgeText = (projects: IProject[]) => {
    const enabledCount = projects.filter(p => p.enabled).length;
    if (enabledCount > 0 && enabled) {
      chrome.action.setBadgeText({ text: enabledCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#1890ff' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  };

  useEffect(() => {
    // Get current active tab URL when component mounts
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.url) {
        const url = tabs[0].url;

        // Extract domain from URL
        try {
          const urlObj = new URL(url);
          const projects = (await mockDataManaer.getProjects()).filter((project) => {
            return url.startsWith(project.domain);
          });
          const domain = urlObj.hostname;
          setCurrentDomain(domain);
          setProjects(projects);
          
          // Update badge text with the projects
          updateBadgeText(projects);

          // Get stored enabled state for this domain
          chrome.storage.local.get([domain], (result) => {
            // If we have a stored value for this domain, use it
            // Otherwise default to true
            const domainEnabled = result[domain] !== undefined ? result[domain] : true;
            setEnabled(domainEnabled);
            
            // Also update badge text considering the enabled state
            if (!domainEnabled) {
              chrome.action.setBadgeText({ text: '' });
            } else {
              updateBadgeText(projects);
            }
          });
        } catch (e) {
          console.error("Invalid URL:", e);
        }
      }
    });
  }, []);

  const toggleEnabled = () => {
    const newEnabledState = !enabled;
    setEnabled(newEnabledState);

    // Save the enabled state for this domain
    if (currentDomain) {
      const storageObj = {} as { [key: string]: boolean };
      storageObj[currentDomain] = newEnabledState;
      chrome.storage.local.set(storageObj);
      
      // Update badge based on the new enabled state
      if (!newEnabledState) {
        chrome.action.setBadgeText({ text: '' });
      } else {
        updateBadgeText(projects);
      }
    }
  };

  const openOptionsPage = () => {
    window.close();
    chrome.runtime.openOptionsPage();
  };

  return (
    <Layout style={{ width: '300px' }}>
      <Header style={{ padding: '0 16px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            {enabled ? <PlayCircleOutlined style={{ color: '#52c41a' }} /> : <PauseCircleOutlined style={{ color: '#ff4d4f' }} />}
            <span>Extension Status</span>
          </Space>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={enabled}
            onChange={toggleEnabled}
          />
        </div>
      </Header>
      <Content style={{ padding: '16px', background: '#f5f5f5' }}>
        <div style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ margin: '0 0 12px 0' }}>
            项目列表
          </Title>
          {projects.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              background: '#fff', 
              borderRadius: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              当前域名下没有可用项目
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '10px',
                  padding: '12px 16px',
                  background: '#fff',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}
              >
                <AppstoreOutlined style={{ marginRight: '12px', color: '#1890ff', fontSize: '16px' }} />
                <span style={{ fontWeight: 500 }}>{project.name}</span>
                <Switch
                  checked={project.enabled}
                  onChange={(checked) => {
                    mockDataManaer.toggleProjectEnabled(project.id);
                    const updatedProjects = projects.map((p) => 
                      p.id === project.id ? { ...p, enabled: checked } : p
                    );
                    setProjects(updatedProjects);
                    // Update badge when project is toggled
                    updateBadgeText(updatedProjects);
                  }}
                  style={{ marginLeft: 'auto' }}
                  size="small"
                />
              </div>
            ))
          )}
        </div>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Button 
          type="primary" 
          icon={<SettingOutlined />} 
          onClick={openOptionsPage}
          block
          size="large"
          style={{ 
            height: '40px', 
            borderRadius: '6px',
            boxShadow: '0 2px 0 rgba(0,0,0,0.045)'
          }}
        >
          高级设置
        </Button>
      </Content>
    </Layout>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
