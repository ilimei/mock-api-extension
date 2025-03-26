import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Menu, Typography, Layout } from 'antd';
import Project from './pages/Project';
import About from './pages/About';
import ProjectDetail from './pages/ProjectDetail'

const { Header, Content } = Layout;
const { Title } = Typography;

const Routes = () => {
  return (
    <Router>
      <Layout style={{ height: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#001529' }}>
          <Title style={{ color: 'white', marginLeft: -24 }}>API Mock Extensions</Title>
          <Menu theme="dark" mode="horizontal" style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Menu.Item key="home">
              <a href="#/">Project</a>
            </Menu.Item>
            <Menu.Item key="about">
              <a href="#/about">About</a>
            </Menu.Item>
          </Menu>
        </Header>
        <Content>
          <Switch>
            <Route exact path="/" component={Project} />
            <Route path="/about" component={About} />
            <Route path="/project/:id" component={ProjectDetail} />
          </Switch>
        </Content>
      </Layout>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
);
