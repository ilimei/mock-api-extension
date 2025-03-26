import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Typography,
  Button,
  Card,
  Descriptions,
  Switch,
  Space,
  Tabs,
  Divider,
  Breadcrumb,
  Empty,
  Spin,
  Popconfirm,
  Form
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useProject } from '../hooks/useProject';
import { useMockApis } from '../hooks/useMockApis';
import ApiTable from '../components/ApiTable';
import ApiFormModal from '../components/ApiFormModal';
import ProjectForm from '../components/ProjectForm';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { project, loading, toggleProjectEnabled, deleteProject, updateProject } = useProject(id);
  const { mockApis, addMockApi, updateMockApi, deleteMockApi, toggleApiEnabled } = useMockApis(id);

  const [isApiModalVisible, setIsApiModalVisible] = useState(false);
  const [isEditApiModalVisible, setIsEditApiModalVisible] = useState(false);
  const [editingApi, setEditingApi] = useState<any>(null);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [projectForm] = Form.useForm();

  const handleBackClick = () => {
    history.push('/');
  };

  const handleDeleteProject = () => {
    if (!project) return;
    deleteProject(project.id).then(() => {
      history.push('/');
    });
  };

  const handleEditProject = () => {
    // Pre-populate the form with existing project data
    projectForm.setFieldsValue({
      name: project?.name,
      description: project?.description,
      domain: project?.domain,
      enabled: project?.enabled
    });
    setIsProjectModalVisible(true);
  };

  const handleProjectModalCancel = () => {
    setIsProjectModalVisible(false);
    projectForm.resetFields();
  };

  const handleProjectModalSave = () => {
    projectForm.validateFields().then(values => {
      updateProject(values);
      setIsProjectModalVisible(false);
      projectForm.resetFields();
    });
  };

  const handleAddApiClick = () => {
    setIsApiModalVisible(true);
  };

  const handleApiModalCancel = () => {
    setIsApiModalVisible(false);
  };

  const handleApiModalSave = (apiData: any) => {
    addMockApi(apiData);
    setIsApiModalVisible(false);
  };

  const handleEditApiClick = (api: any) => {
    setEditingApi(api);
    setIsEditApiModalVisible(true);
  };

  const handleEditApiCancel = () => {
    setIsEditApiModalVisible(false);
    setEditingApi(null);
  };

  const handleEditApiSave = (apiData: any) => {
    updateMockApi(editingApi.id, apiData);
    setIsEditApiModalVisible(false);
    setEditingApi(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty
          description="Project not found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackClick}
          style={{ marginTop: '16px' }}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <a onClick={handleBackClick}>Projects</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{project.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>{project.name}</Title>
            <Text type="secondary">{project.domain}</Text>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={handleEditProject}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this project?"
              onConfirm={handleDeleteProject}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
              >
                Delete
              </Button>
            </Popconfirm>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: '8px' }}>Status:</Text>
              <Switch
                checked={project.enabled}
                onChange={toggleProjectEnabled}
                checkedChildren="On"
                unCheckedChildren="Off"
              />
            </div>
          </Space>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Descriptions column={1} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Description">{project.description}</Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(project.createdAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <ApiOutlined />
                Mock APIs
              </span>
            }
            key="1"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Title level={4}>API Endpoints</Title>
              <Button type="primary" onClick={handleAddApiClick}>Add API Endpoint</Button>
            </div>

            <ApiTable
              apis={mockApis}
              onEdit={handleEditApiClick}
              onDelete={deleteMockApi}
              onToggleEnabled={toggleApiEnabled}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Settings
              </span>
            }
            key="2"
          >
            <p>Project settings will be displayed here.</p>
          </TabPane>
        </Tabs>
      </Card>

      <ApiFormModal
        title="Add API Endpoint"
        visible={isApiModalVisible}
        onCancel={handleApiModalCancel}
        onSave={handleApiModalSave}
        initialValues={null}
        okText="Create"
      />

      <ApiFormModal
        title="Edit API Endpoint"
        visible={isEditApiModalVisible}
        onCancel={handleEditApiCancel}
        onSave={handleEditApiSave}
        initialValues={editingApi}
        okText="Save"
      />

      <ProjectForm
        form={projectForm}
        isModalVisible={isProjectModalVisible}
        isEditing={true}
        onOk={handleProjectModalSave}
        onCancel={handleProjectModalCancel}
      />
    </div>
  );
};

export default ProjectDetail;
