import React from 'react';
import { Table, Tag, Switch, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MockApi } from '@/common/mockDataManagerClient';

interface ApiTableProps {
  apis: MockApi[];
  onEdit: (api: MockApi) => void;
  onDelete: (apiId: string) => void;
  onToggleEnabled: (apiId: string, enabled: boolean) => void;
}

const ApiTable: React.FC<ApiTableProps> = ({ apis, onEdit, onDelete, onToggleEnabled }) => {
  const getMethodTag = (method: string) => {
    const color =
      method === 'GET' ? 'green' :
        method === 'POST' ? 'blue' :
          method === 'PUT' ? 'orange' :
            method === 'DELETE' ? 'red' : 'default';

    return <Tag color={color}>{method}</Tag>;
  };

  const getStatusTag = (status: number) => {
    const color =
      status >= 200 && status < 300 ? 'green' :
        status >= 300 && status < 400 ? 'blue' :
          status >= 400 && status < 500 ? 'orange' : 'red';

    return <Tag color={color}>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => getMethodTag(method)
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Status',
      dataIndex: 'responseStatus',
      key: 'responseStatus',
      render: (status: number) => getStatusTag(status)
    },
    {
      title: 'Delay (ms)',
      dataIndex: 'delay',
      key: 'delay',
    },
    {
      title: 'Status',
      key: 'enabled',
      render: (record: MockApi) => (
        <Switch
          checked={record.enabled}
          size="small"
          checkedChildren="On"
          unCheckedChildren="Off"
          onChange={(checked) => onToggleEnabled(record.id, checked)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: MockApi) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this API?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={apis}
      columns={columns}
      rowKey="id"
      pagination={false}
    />
  );
};

export default ApiTable;
