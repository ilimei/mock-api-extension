import React, { useState, useEffect, useRef } from 'react';
import { List, Card, Button, Form, Empty, Typography, Space, Switch, message, Tooltip } from 'antd';
import { PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import mockDataManager, { IProject as ProjectType } from '../../common/mockDataManagerClient';
import ProjectForm from '../components/ProjectForm';

const { Title } = Typography;

const Project: React.FC = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects from storage when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const savedProjects = await mockDataManager.getProjects();
        setProjects(savedProjects);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleAddProject = () => {
    setIsEditing(false);
    setCurrentProjectId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProject = (e: React.MouseEvent, project: ProjectType) => {
    e.stopPropagation(); // Prevent card click event
    setIsEditing(true);
    setCurrentProjectId(project.id);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      domain: project.domain,
      enabled: project.enabled
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && currentProjectId) {
        // Update existing project
        const updatedProject = await mockDataManager.updateProject({ id: currentProjectId, projectData: values });
        if (updatedProject) {
          setProjects(prevProjects =>
            prevProjects.map(project => project.id === currentProjectId ? updatedProject : project)
          );
        }
      } else {
        // Create new project
        const newProject = await mockDataManager.addProject({
          name: values.name,
          description: values.description,
          domain: values.domain,
          enabled: values.enabled || false
        });
        setProjects(prevProjects => [...prevProjects, newProject]);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleToggleEnabled = async (checked: boolean, project: ProjectType) => {
    const updatedProject = await mockDataManager.updateProject({ id: project.id, projectData: { enabled: checked } });
    if (updatedProject) {
      setProjects(prevProjects =>
        prevProjects.map(p => p.id === project.id ? updatedProject : p)
      );
    }
  };

  const handleProjectClick = (project: ProjectType) => {
    history.push(`/project/${project.id}`);
  };

  const handleExportProjects = async () => {
    try {
      setLoading(true);
      
      // Create a comprehensive export with projects and their mockAPIs
      const exportData = [];
      
      for (const project of projects) {
        // Fetch mockAPI data for each project
        const mockAPIs = await mockDataManager.getMockApis(project.id);
        
        // Add project with its mockAPIs to export data
        exportData.push({
          project,
          mockAPIs
        });
      }
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `mock-projects-with-apis-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      const totalAPIs = exportData.reduce((sum, item) => sum + item.mockAPIs.length, 0);
      message.success(`Successfully exported ${projects.length} projects with ${totalAPIs} mockAPIs`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export projects');
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportProjects = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);
          
          let projectsToImport = [];
          
          // Handle different import formats
          if (Array.isArray(parsedData)) {
            // Format from handleExportProjects - array of { project, mockAPIs }
            projectsToImport = parsedData;
          } else if (parsedData.project && parsedData.mockAPIs) {
            // Format from handleExportProject - single { project, mockAPIs }
            projectsToImport = [parsedData];
          } else {
            message.error('Invalid import format. Expected project data structure not found.');
            return;
          }

          let importedProjectCount = 0;
          let importedApiCount = 0;
          setLoading(true);
          
          for (const item of projectsToImport) {
            const { project, mockAPIs } = item;
            
            if (project && project.name && typeof project.name === 'string') {
              // Create new project (removing id to ensure we create a new one)
              const { id, createdAt, updatedAt, ...projectData } = project;
              
              const newProject = await mockDataManager.addProject({
                name: projectData.name,
                description: projectData.description || '',
                domain: projectData.domain || '',
                enabled: projectData.enabled || false
              });
              
              if (newProject) {
                importedProjectCount++;
                
                // Import the associated mockAPIs for this project
                if (Array.isArray(mockAPIs) && mockAPIs.length > 0) {
                  for (const mockAPI of mockAPIs) {
                    
                    try {
                      await mockDataManager.addMockApi({
                        projectId: newProject.id, 
                        apiData: mockAPI
                      });
                      importedApiCount++;
                    } catch (error) {
                      console.error('Failed to import mockAPI:', error);
                    }
                  }
                }
              }
            }
          }
          
          // Reload projects after import
          const savedProjects = await mockDataManager.getProjects();
          setProjects(savedProjects);
          
          message.success(`Successfully imported ${importedProjectCount} projects with ${importedApiCount} mockAPIs`);
        } catch (error) {
          console.error('Import parsing failed:', error);
          message.error('Failed to parse import file');
        } finally {
          setLoading(false);
          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Failed to import projects');
      setLoading(false);
    }
  };

  const handleExportProject = async (e: React.MouseEvent, project: ProjectType) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      setLoading(true);
      
      // Fetch mockAPI data for this project
      const mockAPIs = await mockDataManager.getMockApis(project.id);
      
      // Create export data including project and its mockAPIs
      const exportData = {
        project,
        mockAPIs
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `${project.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      message.success(`Project "${project.name}" exported successfully with ${mockAPIs.length} mockAPIs`);
    } catch (error) {
      console.error('Export project failed:', error);
      message.error('Failed to export project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>My Projects</Title>
        <Space>
          <Button
            icon={<ImportOutlined />}
            onClick={handleImportClick}
          >
            Import
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportProjects}
            disabled={projects.length === 0}
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProject}
          >
            Add Project
          </Button>
        </Space>
      </div>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImportProjects}
      />

      {projects.length === 0 ? (
        <Empty
          description="No projects yet. Create your first project!"
          style={{ margin: '40px 0' }}
        />
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={projects}
          renderItem={(project) => (
            <List.Item>
              <Card
                title={project.name}
                hoverable
                onClick={() => handleProjectClick(project)}
                extra={
                  <Space>
                    <Tooltip title="Export project with mockAPIs">
                      <Button
                        type="text"
                        size="small"
                        icon={<ExportOutlined />}
                        onClick={(e) => handleExportProject(e, project)}
                      />
                    </Tooltip>
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => handleEditProject(e, project)}
                    >
                      Edit
                    </Button>
                  </Space>
                }
              >
                <p>{project.description}</p>
                {project.domain && <p><strong>Domain:</strong> {project.domain}</p>}
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <Switch
                    checked={project.enabled}
                    onChange={(checked) => handleToggleEnabled(checked, project)}
                    onClick={(checked, e) => e.stopPropagation()}
                    checkedChildren="On"
                    unCheckedChildren="Off"
                  />
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      <ProjectForm
        form={form}
        isModalVisible={isModalVisible}
        isEditing={isEditing}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Project;