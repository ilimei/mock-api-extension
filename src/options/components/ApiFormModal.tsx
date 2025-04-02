import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import JsonEditor from './JsonEditor'; // Import the JsonEditor component

interface ApiFormModalProps {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  initialValues: any | null;
  okText: string;
}

const ApiFormModal: React.FC<ApiFormModalProps> = ({
  title,
  visible,
  onCancel,
  onSave,
  initialValues,
  okText
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
        form.setFieldsValue({
          method: 'GET',
          responseStatus: 200,
          responseBody: JSON.stringify({ message: "Success" }, null, 2),
          delay: 0,
          enabled: true
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={okText}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="method"
          label="HTTP Method"
          rules={[{ required: true, message: 'Please select a method' }]}
        >
          <Select>
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="PATCH">PATCH</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="path"
          label="API Path"
          rules={[
            { required: true, message: 'Please enter an API path' },
            { pattern: /^\//, message: 'Path must start with /' }
          ]}
        >
          <Input placeholder="/api/endpoint" />
        </Form.Item>

        <Form.Item
          name="responseStatus"
          label="Response Status"
          rules={[{ required: true, message: 'Please enter a status code' }]}
        >
          <Select>
            {HTTP_STATUS_CODES.map(({ value, label }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="responseBody"
          label="Response Body (JSON)"
          rules={[
            { required: true, message: 'Please enter a response body' },
            {
              validator: (_, value) => {
                try {
                  if (value) {
                    JSON.parse(value);
                  }
                  return Promise.resolve();
                } catch (error) {
                  return Promise.reject('Please enter valid JSON');
                }
              }
            }
          ]}
        >
          <JsonEditor placeholder='{ "message": "Success" }' />
        </Form.Item>

        <Form.Item
          name="delay"
          label="Response Delay (ms)"
        >
          <Input type="number" min={0} max={10000} />
        </Form.Item>

        <Form.Item
          name="enabled"
          label="Status"
          valuePropName="checked"
        >
          <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ApiFormModal;
