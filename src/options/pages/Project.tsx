import React, { useState, useEffect } from 'react';
import { List, Card, Button, Form, Empty, Typography, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import mockDataManager, { IProject as ProjectType } from '../../common/mockDataManager';
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
        const updatedProject = await mockDataManager.updateProject(currentProjectId, values);
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
    const updatedProject = await mockDataManager.updateProject(project.id, { enabled: checked });
    if (updatedProject) {
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === project.id ? updatedProject : p)
      );
    }
  };

  const handleProjectClick = (project: ProjectType) => {
    history.push(`/project/${project.id}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>My Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddProject}
        >
          Add Project
        </Button>
      </div>

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
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => handleEditProject(e, project)}
                  >
                    Edit
                  </Button>
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