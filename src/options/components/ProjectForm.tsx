import React from 'react';
import { Form, Input, Switch, Modal } from 'antd';
import { FormInstance } from 'antd/es/form';

interface ProjectFormProps {
  form: FormInstance;
  isModalVisible: boolean;
  isEditing: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  form, 
  isModalVisible, 
  isEditing, 
  onOk, 
  onCancel 
}) => {
  return (
    <Modal
      title={isEditing ? "Edit Project" : "Add New Project"}
      open={isModalVisible}
      onOk={onOk}
      onCancel={onCancel}
      okText={isEditing ? "Save" : "Create"}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea
            placeholder="Enter project description"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="domain"
          label="Domain"
          rules={[
            { required: true, message: 'Please enter a domain' },
            { type: 'url', message: 'Please enter a valid URL' }
          ]}
        >
          <Input placeholder="Enter domain (e.g., https://example.com)" />
        </Form.Item>

        <Form.Item
          name="enabled"
          label="Status"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectForm;
